# 部署说明

本站点同时发布到两个地方，同一份源码、两份构建产物：

| 目标 | 地址 | base | 由谁发布 |
|---|---|---|---|
| GitHub Pages | https://luomingguo.github.io/archipelago/ | `/archipelago/` | `.github/workflows/deploy.yml` 的 `build` / `deploy` job |
| 自建服务器 hk | https://notes.lobomiao.uk | `/` | 同一个 workflow 的 `deploy-hk` job |

base 由 `DOCS_BASE` 环境变量控制。生产产物统一由 `frontend/` 的 Astro 构建生成。
本地 Astro 开发使用根路径；Pages 兼容性由 `npm run site:build:pages` 与 `npm run site:verify:pages` 验证。

## hk 上的结构

hk 用一个全局 Caddy 容器独占 80/443（`/home/mac/infra/edge/`），各站点只往 `sites/*.caddy`
放一个配置片段，业务容器接入 `edge` 网络后用别名互通。本项目沿用这套约定：

```
/home/mac/infra/edge/sites/notes.caddy   # 反代 notes.lobomiao.uk -> notes-web:80，Caddy 自动签发证书
/home/mac/mit-cs-notes/
├── docker-compose.yml                   # nginx 容器，edge 网络别名 notes-web，不暴露端口
├── nginx.conf
└── site/
    ├── current -> releases/<git-sha>    # 软链，指向当前线上版本
    └── releases/<git-sha>/              # 每次发布一个独立目录，只保留最近 3 个
```

nginx 容器挂载的是 `site/` 整个目录而不是 `current` 本身 —— bind mount 会在容器启动时把软链
解析成固定路径，挂父目录才能让软链按请求解析，于是发布时切换软链即刻生效，不需要重启容器。

## 发布流程

push 到 `release` 分支后，`deploy-hk` job 会：

1. 用 `DOCS_BASE=/` 构建并完成路由、资源与 RAG 锚点校验，再打包成 `dist.tar.gz`；
2. 通过 Workload Identity Federation 换取 GCP 凭证（仓库里不存长期密钥）；
3. 经 IAP 隧道把产物和 `deploy/` 下的配置传到 hk 上本次运行独有的 `/tmp/notes-deploy-<run-id>-<attempt>/`；
4. 在 hk 上执行 `remote-deploy.sh`：解包到新的 release 目录 → 校验产物 → 原子切软链 →
   `docker compose up -d` → 配置片段有变化才 reload Caddy → 清理旧版本 → 容器内自检首页。

解包失败或产物不完整时脚本会在切软链之前退出，线上版本不受影响。

## 一次性配置（已完成，重建环境时参考）

GCP 侧（项目 `project-cde82b79-83b0-43d2-890`，实例 `hk` / `asia-east2-c`）：

```bash
# 免密登录用的身份池与 OIDC provider，限定只有本人名下的仓库能用
gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github \
  --location=global --workload-identity-pool=github \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner=='luomingguo'"

# 部署用服务账号，权限收到最小：只够开 IAP 隧道 + 往实例元数据写临时 SSH 公钥
gcloud iam service-accounts create gh-deploy-notes
gcloud iam roles create ghDeployIapSsh --project=<PROJECT> --file=role.yaml   # 见下方权限列表
gcloud projects add-iam-policy-binding <PROJECT> \
  --member="serviceAccount:gh-deploy-notes@<PROJECT>.iam.gserviceaccount.com" \
  --role="projects/<PROJECT>/roles/ghDeployIapSsh"
gcloud iam service-accounts add-iam-policy-binding <COMPUTE_DEFAULT_SA> \
  --member="serviceAccount:gh-deploy-notes@<PROJECT>.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 只允许 luomingguo/archipelago 这个仓库冒充该服务账号
gcloud iam service-accounts add-iam-policy-binding gh-deploy-notes@<PROJECT>.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/attribute.repository/luomingguo/archipelago"
```

自定义角色 `ghDeployIapSsh` 的权限（刻意不给 instanceAdmin，避免 CI 能删机器）：
`compute.projects.get`、`compute.instances.get`、`compute.instances.setMetadata`、
`iap.tunnelInstances.accessViaIAP`。

GitHub 仓库 secrets：

- `GCP_WIF_PROVIDER` = `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/github`
- `GCP_DEPLOY_SA` = `gh-deploy-notes@<PROJECT>.iam.gserviceaccount.com`

DNS（Cloudflare，域名 `lobomiao.uk`）：`notes` 的 A 记录指向 hk 的公网 IP `34.96.171.122`。
开橙云代理时，Cloudflare 的 SSL 模式必须是 **Full (strict)**，否则会和 Caddy 的自动证书打架。

## 排查

```bash
gcloud compute ssh hk --zone=asia-east2-c --tunnel-through-iap

docker logs --tail 50 mit-cs-notes-web        # nginx
docker logs --tail 50 caddy | grep notes      # 证书签发 / 反代
ls -l /home/mac/mit-cs-notes/site/current     # 当前线上版本
curl -I -H 'Host: notes.lobomiao.uk' http://127.0.0.1/   # 绕过 Cloudflare 直接打源站
```

回滚：把 `site/current` 软链指回 `site/releases/` 下的上一个版本即可，不用重新构建。
软链必须用**相对路径**——容器里 `site/` 挂在 `/srv/notes`，指向宿主机绝对路径的软链在容器内是断的，
表现为所有页面 404。

```bash
cd /home/mac/mit-cs-notes/site
sudo ln -sfn releases/<旧sha> current.tmp && sudo mv -T current.tmp current
```

#!/usr/bin/env bash
# 在 hk 上执行的发布脚本，由 GitHub Actions 经 IAP 隧道 SSH 调用。
# 约定：CI 已经把 dist.tar.gz 和 deploy/ 下的配置文件放到 STAGE 指定的暂存目录。
#
# 发布是「先解包到独立目录、再原子切软链」，解包失败不会影响线上正在服务的版本。
set -euo pipefail

RELEASE="${1:?usage: remote-deploy.sh <release-id>}"
# 手工发布默认使用固定目录；CI 会用 STAGE=... 指向每次运行独有的目录
STAGE="${STAGE:-/tmp/notes-deploy}"
APP=/home/mac/mit-cs-notes
SITE="$APP/site"
EDGE_SITES=/home/mac/infra/edge/sites
KEEP=3

sudo mkdir -p "$SITE/releases"

# 1. 同步容器与站点配置。内容没变就不动，避免无谓的重启和 Caddy reload。
for f in docker-compose.yml nginx.conf; do
	if ! sudo cmp -s "$STAGE/$f" "$APP/$f"; then
		sudo cp "$STAGE/$f" "$APP/$f"
		echo "updated $APP/$f"
	fi
done

changed_caddy=0
if ! sudo cmp -s "$STAGE/notes.caddy" "$EDGE_SITES/notes.caddy"; then
	sudo cp "$STAGE/notes.caddy" "$EDGE_SITES/notes.caddy"
	changed_caddy=1
	echo "updated $EDGE_SITES/notes.caddy"
fi

# 2. 解包新版本
NEW="$SITE/releases/$RELEASE"
sudo rm -rf "$NEW"
sudo mkdir -p "$NEW"
sudo tar -xzf "$STAGE/dist.tar.gz" -C "$NEW"
# 产物完整性兜底：首页在才认为这次构建是完整的
sudo test -f "$NEW/index.html"

# 3. 原子切换软链（ln -sfn + mv -T，避免出现短暂的「软链不存在」窗口）。
#    必须用相对路径：容器里 site/ 挂在 /srv/notes 下，指向宿主机绝对路径的软链在容器内是断的。
sudo ln -sfn "releases/$RELEASE" "$SITE/current.tmp"
sudo mv -T "$SITE/current.tmp" "$SITE/current"
sudo chown -R mac:mac "$APP"
echo "current -> $NEW"

# 4. 起容器。配置没变时 compose 不会重建，nginx 走软链，内容更新无需重启。
#    注意：$APP 在 /home/mac 下（750），CI 的登录用户进不去，所以全程不 cd，
#    用 --project-directory 让 compose 自己去解析相对路径的挂载。
sudo docker compose --project-directory "$APP" -f "$APP/docker-compose.yml" up -d

# 5. reload Caddy 的两种情况：配置片段有变化，或者 Caddy 当前根本没加载本站点
#    （比如上一次发布中途失败，片段已经落盘但没来得及 reload）。
#    Caddy 会先校验新配置，校验不过则保留旧配置继续运行，不会波及其他站点。
domain=$(sed -n 's/^\([a-z0-9.-]*\) {$/\1/p' "$STAGE/notes.caddy" | head -1)
if [ "$changed_caddy" = 1 ] || [ -z "$domain" ] ||
	! sudo docker exec caddy wget -qO- http://127.0.0.1:2019/config/ | grep -q "$domain"; then
	sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
	echo "caddy reloaded"
fi

# 6. 清理旧版本，只留最近 $KEEP 个（同样因为目录权限，交给 root 去展开通配符）
sudo bash -c "ls -1dt '$SITE/releases'/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf"

# 7. 自检：容器内直接请求首页。容器刚创建时 nginx 可能还没监听，重试几次再判定失败。
for i in $(seq 1 10); do
	# 用 127.0.0.1 而不是 localhost：容器里 localhost 会先解析到 ::1，而 nginx 只监听了 IPv4
	if sudo docker exec mit-cs-notes-web wget -qO /dev/null http://127.0.0.1/; then
		echo "deployed OK: $RELEASE"
		exit 0
	fi
	sleep 2
done
echo "self check failed: nginx did not serve / after 20s" >&2
exit 1

# 笔记站 RAG 问答 + 学习路径

给「MIT Notes by Ron」加两个能力：

- **问我的笔记** —— 读者提问，服务在全站笔记里检索，让大模型给出带出处的回答。
- **学习路径** —— 从一个具体目标出发，把二十多门课的笔记串成有依赖顺序的阅读路线。

单门课的笔记网上到处都是，跨二十多门课的语义检索和路线规划只有掌握全景的人做得到。这是这个笔记站真正难以复制的部分。

---

## 架构

```
读者浏览器
    │  POST /rag/ask   （同源，SSE 流式）
    ▼
Caddy (hk, 已有的 edge 网关)
    ├── /rag/*  ──► notes-rag:3100   Node 服务
    └── 其余    ──► notes-web:80     Astro 静态产物
                          │
                    notes-db:5432    Postgres + pgvector
```

问答一次请求的内部流程：

```
问题 ──► 嵌入(query) ──► pgvector 粗召回 30 条
                              │
                       rerank 精排 8 条
                              │
                  生成模型流式作答（带 [n] 引用）
```

**为什么要 rerank 这一跳**：只做向量检索时，中文近义表述很容易召回一堆「看着像但答非所问」的片段。rerank 是交叉编码器，能真正判断这段有没有回答这个问题 —— 加这一跳对答案质量的提升，比换更大的嵌入模型明显得多。

---

## 目录

| 文件 | 作用 |
|---|---|
| `src/corpus.ts` | 遍历 docs/、推导站点 URL 和标题锚点 |
| `src/chunk.ts` | Markdown 切块与清洗 |
| `src/embedder.ts` | 嵌入 / 重排（Voyage 与 OpenAI 兼容两种后端） |
| `src/llm.ts` | 生成（Anthropic 与 OpenAI 兼容两种后端） |
| `src/db.ts` | Postgres + pgvector 读写 |
| `src/ingest.ts` | 入库 CLI（增量） |
| `src/retrieve.ts` | 两段式检索 |
| `src/answer.ts` | 组装提示词与引用编号 |
| `src/server.ts` | HTTP 服务（SSE） |
| `src/paths.ts` | 学习路径生成 CLI |
| `src/verify.ts` | URL / 锚点映射校验 |
| `src/smoke.ts` | 服务商连通性自检（不碰数据库） |
| `sql/schema.sql` | 表结构 |
| `compose.yaml` | RAG 栈（服务 + pgvector），与站点的发布流程相互独立 |
| `deploy/Dockerfile` | 服务镜像 |
| `deploy/backup.sh` | 每日 pg_dump 归档到 nas |

站点自身的部署配置在仓库根的 `deploy/`（已有的 CI 流程），不在这里。
两者唯一的交集是 `deploy/notes.caddy` 里新增的 `/rag/*` 转发规则。

---

## 本地跑起来

```bash
cd rag
npm install
cp .env.example .env      # 填 EMBED_API_KEY 和 LLM_API_KEY
```

起一个带 pgvector 的库：

```bash
docker run -d --name notes-db-dev \
  -e POSTGRES_DB=notes -e POSTGRES_USER=notes -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 pgvector/pgvector:pg16
```

`.env` 里把 `DATABASE_URL` 指向它，然后：

```bash
npm run smoke               # 先验服务商连通性（嵌入/重排/生成三项）
npm --prefix ../frontend run build
npm run verify              # 用 Astro 产物校验 URL/锚点映射
npm run ingest              # 入库，约 6700 块
npm run paths               # 生成学习路径
npm run dev                 # 起服务
```

换服务商或换模型后先跑 `npm run smoke`，比直接跑 ingest 再排查快得多。
只想验嵌入和重排、暂时不测生成：`npm run smoke -- --no-llm`。

试一下：

```bash
curl -N -X POST localhost:3100/api/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"xv6 的页表和数据库的缓冲池在缓存思路上有什么共同点？"}'
```

---

## 部署到 hk

站点本身已经有一套 CI 发布流程（见 `deploy/README.md`）：push 到 `release` 分支 →
GitHub Actions 用 `DOCS_BASE=/` 构建 → 经 IAP 隧道传到 hk → 解包到 `site/releases/<sha>`
→ 原子切软链。**这套流程不用改**，问答服务是独立的一套栈挂在旁边。

为什么分成两套 compose：站点每次 push 都要重新发布，频繁且要快；RAG 这套带着数据卷、
只在服务代码变动时才发布，不该被每次文档改动牵连重启，更不该让 CI 拿到这里的 API key。
两者只通过 `edge` 网络耦合 —— Caddy 把 `/rag/*` 转给 `notes-rag`，其余给 `notes-web`。

**1. 传服务代码**

```bash
ssh hk 'mkdir -p /home/mac/mit-cs-notes-rag'
rsync -az --delete --exclude node_modules --exclude dist --exclude .env \
    rag/ hk:/home/mac/mit-cs-notes-rag/
```

**2. 写 `.env`**（在 hk 上，`/home/mac/mit-cs-notes-rag/.env`）

```env
POSTGRES_PASSWORD=<随机强密码>
IP_SALT=<随机串>

# 嵌入与重排
EMBED_API_KEY=<Voyage 的 key>

# 生成（默认硅基流动；换别家见 .env.example 末尾的对照表）
LLM_API_KEY=<生成服务商的 key>
```

**3. 起栈**

```bash
ssh hk 'cd /home/mac/mit-cs-notes-rag && docker compose up -d --build'
```

**4. 首次入库**

最省事的做法是在本地跑，把 `DATABASE_URL` 通过 SSH 隧道指向 hk：

```bash
ssh -N -L 15432:mit-cs-notes-db:5432 hk &
DATABASE_URL=postgresql://notes:<密码>@localhost:15432/notes npm run ingest
```

入库是一次性批处理，走隧道慢一点无所谓 —— 只有**检索**才必须留在 hk 本地。

**5. 发布带 `/rag` 路由的 Caddy 片段**

`deploy/notes.caddy` 已经加好了 `/rag/*` 的转发规则。它由 CI 的发布流程同步到
`/home/mac/infra/edge/sites/`，所以只要往 `release` 分支推一次，
`remote-deploy.sh` 会检测到片段有变化并自动 reload Caddy。

急着生效也可以手工推一次：

```bash
scp deploy/notes.caddy hk:/tmp/ && \
ssh hk 'sudo cp /tmp/notes.caddy /home/mac/infra/edge/sites/ && \
        sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile'
```

**6. 验一下**

```bash
curl -s https://notes.lobomiao.uk/rag/health
# {"ok":true,"chunks":<当前数量>}
```

**7. 挂上备份**

```bash
ssh hk 'chmod +x /home/mac/mit-cs-notes-rag/backup.sh'
# crontab -e 加：15 4 * * * /home/mac/mit-cs-notes-rag/backup.sh >> /var/log/notes-backup.log 2>&1
```

> RAG 栈没起来时 `/rag/*` 会返回 502，但静态站点完全不受影响 —— 问答按钮也只在
> `DOCS_BASE=/` 那份构建里出现，GitHub Pages 那份不会给读者一个必然失败的按钮。

---

## 日常维护

**笔记更新后重新入库**

```bash
npm run ingest
```

增量是两层的：文件哈希没变的整篇跳过；文件变了也只对内容变过的块重新调嵌入 API。改一个错别字不会重嵌整篇。

从旧目录升级到 `docs/zh/cs/` 时，首次 `npm run ingest` 会把文档主键迁到新源码路径，并按旧路径复用内容未变的块向量；不需要为这次纯目录迁移使用 `--force`。入库完成后，旧路径记录会按正常的下线清理流程删除。

**换嵌入模型**

必须全量重来，因为向量空间不兼容：

```bash
EMBED_MODEL=voyage-4-large npm run ingest -- --force
```

维度变了的话把 `EMBED_DIM` 一起改掉，并先把表删掉重建 —— pgvector 的 `vector(N)` 是定长的：

```bash
docker compose exec notes-db psql -U notes -d notes -c 'DROP TABLE IF EXISTS chunks, documents CASCADE'
npm run ingest -- --force
```

填错维度不会静默出错：`ingest` 会在写第一批之前校验实际返回长度并报错退出。

**重新生成学习路径**

```bash
npm run paths                  # 全部
npm run paths -- --goal db-kernel   # 只重生成一条
```

生成后会同时写入 `public/rag-paths.json`，需要重新构建站点才会生效。

**修改了 Astro 公开路由或标题锚点规则之后**

```bash
npm run site:build
npm run site:verify
```

URL 和锚点映射都必须 100% 命中，避免 RAG 引用静默跳到 404 或错误章节。

---

## 成本与选型（都是实测，不是文档抄的）

当前配置：**嵌入 / 重排 / 生成全部走智谱**，一个 key 覆盖三件事，Flash 系列免费。

| 环节 | 模型 | 实测 |
|---|---|---|
| 嵌入 | `embedding-3`（压到 1024 维） | 42 块 / 9.4s |
| 重排 | `rerank` | 排序正确 |
| 生成 | `glm-4.7-flash`（关思考链） | 首字 470ms |
| 端到端问答 | | 首字 937ms / 总计 4.0s |

### 踩过的坑（换服务商前先看这里）

**1. Voyage 不绑支付方式基本不可用。**
「200M 免费 token」是真的，但未绑卡时限流 **3 RPM / 10K TPM**。实测后果：
全量入库 210 次请求要跑 70 分钟；运行时每次提问要 1 次嵌入 + 1 次重排，
全站每分钟最多答 1.5 个问题。它的重排分数标定是几家里最好的，
如果哪天绑了卡，换回去只要改 `EMBED_*` 那几行。

**2. 智谱 embedding-3 默认 2048 维，超过 pgvector HNSW 的 2000 维上限。**
实测报错 `column cannot have more than 2000 dimensions for hnsw index`。
必须用 `EMBED_EXTRA_BODY={"dimensions":1024}` 压下来。

**3. 重排分数不能跨服务商当阈值用。**
同一组文档（一条讲页表、两条完全无关）：

| 服务商 | 相关文档 | 无关文档 |
|---|---|---|
| Voyage rerank-2.5 | 0.63 | 0.26 / 0.25 |
| 智谱 rerank | 1.00 | **0.9994 / 0.9990** |

智谱的排序是对的，但绝对分数没有区分度。原先用 rerank 分数判断
「站内有没有写过这个话题」，换到智谱后这个分支永远不会触发 ——
任何问题都会拿着不相关的片段硬编答案。
现在改用**向量余弦距离**（`RETRIEVAL_MAX_DISTANCE`）做这个判定，
那是模型自身的度量，跨服务商稳定得多。实测「红楼梦的作者是谁」
能被正确判为未覆盖，441ms 返回。

**4. glm-4.7-flash 是思考模型，不关思考链没法用。**
实测流式响应里 `reasoning_content` 刷了 551 个片段、`content` 只有 1 个 ——
读者要干等几十秒才看到第一个字。`LLM_EXTRA_BODY={"thinking":{"type":"disabled"}}`
关掉后首字 470ms。代码里也做了兜底：`reasoning_content` 绝不会被当成正文，
同时会给前端推一个 `thinking` 事件，让面板显示「模型正在思考…」而不是空白。

### 其他可选服务商

对照表见 `.env.example` 末尾。生成那一侧几乎都是 OpenAI 兼容，改三个变量即可；
但**只有智谱、硅基流动、Voyage 同时提供 embeddings 和 rerank**，
Gemini 等只有 embeddings，换过去就得砍掉重排那一跳。

## 埋在里面的两个运营数据

`ask_log` 表记录每次提问、引用了哪几篇、检索最高分。这比 PV 有用得多：

```sql
-- 读者最想知道什么
SELECT question, created_at FROM ask_log ORDER BY created_at DESC LIMIT 50;

-- 内容空白区：被问到但站内没料的问题，就是你的选题清单
SELECT * FROM content_gaps LIMIT 30;

-- 哪些笔记最常被引用
SELECT unnest(cited_urls) AS url, count(*) AS n
FROM ask_log GROUP BY url ORDER BY n DESC LIMIT 20;
```

`content_gaps` 是我觉得最值钱的一个视图 —— 它直接告诉你下一篇该写什么。

---

## 已知取舍

- **向量库放在 hk 本地，不在 nas。** 检索是每次提问的同步阻塞路径，跨 WireGuard 会显著拉高首字延迟，nas 一抖问答就挂。补偿方式是每天 `pg_dump` 归档到 nas（`deploy/backup.sh`）。向量库本身是可再生的，真正需要备份的是 `ask_log`。
- **限流用进程内 Map，不用 Redis。** 服务是单实例，进程内计数就够，少一个外部依赖少一处故障点。要多副本时再换。
- **服务商可插拔。** 嵌入/重排和生成是两套独立配置，各支持两种后端。这不是过度设计 ——
  免费额度和模型价格变化很快，锁死在一家上，换的时候要动的是代码而不是配置。
- **入库用多行 INSERT 而不是逐条。** 从本地经隧道灌库时每条 INSERT 都是一次网络往返，
  6700 块就是 6700 次往返，光延迟就十几分钟。合并成每篇一次后快了一个数量级。
- **答案只依赖检索到的片段。** 系统提示词明确禁止用模型自身知识补足 —— 读者是冲着「这个人的笔记怎么说」来的，编造会毁掉这份信任。站内没写的话，服务会直说没覆盖。

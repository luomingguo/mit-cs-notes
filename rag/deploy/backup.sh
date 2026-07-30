#!/usr/bin/env bash
#
# 把 hk 上的向量库备份到 nas。
#
# 全局约定是「nas 是唯一数据库」，这个项目破了例把库放在 hk 本地 ——
# 因为检索是每次提问的同步阻塞路径，跨 WireGuard 打到 nas 会显著拉高首字延迟，
# 且隧道一抖问答就挂。这个脚本是对那个约定的补偿：数据最终仍然归档到 nas。
#
# 部署：
#   scp backup.sh hk:/home/mac/mit-cs-notes-rag/backup.sh
#   chmod +x /home/mac/mit-cs-notes-rag/backup.sh
#   crontab -e  加入：
#     15 4 * * * /home/mac/mit-cs-notes-rag/backup.sh >> /var/log/notes-backup.log 2>&1
set -euo pipefail

STACK_DIR=/home/mac/mit-cs-notes-rag
NAS_HOST=10.10.0.1           # nas 的 WireGuard 隧道地址
NAS_DIR=/volume1/backup/notes
KEEP_DAYS=30

STAMP=$(date +%Y%m%d-%H%M%S)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

DUMP="$TMP/notes-$STAMP.sql.gz"

echo "[$(date -Is)] 开始备份"

# --clean --if-exists 让 dump 可以直接恢复到一个已有库上
docker compose -f "$STACK_DIR/compose.yaml" exec -T notes-db \
  pg_dump -U notes -d notes --clean --if-exists \
  | gzip -9 > "$DUMP"

SIZE=$(du -h "$DUMP" | cut -f1)
echo "[$(date -Is)] dump 完成，大小 $SIZE"

# 传到 nas
ssh -o ConnectTimeout=15 "$NAS_HOST" "mkdir -p $NAS_DIR"
scp -o ConnectTimeout=15 "$DUMP" "$NAS_HOST:$NAS_DIR/"
echo "[$(date -Is)] 已上传到 nas:$NAS_DIR"

# 清理 nas 上的旧备份
ssh -o ConnectTimeout=15 "$NAS_HOST" \
  "find $NAS_DIR -name 'notes-*.sql.gz' -mtime +$KEEP_DAYS -delete"
echo "[$(date -Is)] 已清理 $KEEP_DAYS 天前的备份"

echo "[$(date -Is)] 完成"

# ———— 恢复步骤（备查）————
# scp nas:/volume1/backup/notes/notes-YYYYmmdd-HHMMSS.sql.gz .
# gunzip -c notes-*.sql.gz | docker compose exec -T notes-db psql -U notes -d notes
#
# 注意：向量库是可再生的 —— 真丢了也可以直接 npm run ingest -- --force 重建，
# 成本只是几分钟和几百万 token（在 Voyage 免费额度内）。
# 备份的真正价值是 ask_log 那张表：读者问过什么是不可再生的一手数据。

#!/usr/bin/env bash
# 在 hk 上执行的发布脚本，由 GitHub Actions 经 IAP 隧道 SSH 调用。
# 约定：CI 已经把 dist.tar.gz 和 deploy/ 下的配置文件放到 /tmp/notes-deploy/。
#
# 发布是「先解包到独立目录、再原子切软链」，解包失败不会影响线上正在服务的版本。
set -euo pipefail

RELEASE="${1:?usage: remote-deploy.sh <release-id>}"
STAGE=/tmp/notes-deploy
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

# 3. 原子切换软链（ln -sfn + mv -T，避免出现短暂的「软链不存在」窗口）
sudo ln -sfn "$NEW" "$SITE/current.tmp"
sudo mv -T "$SITE/current.tmp" "$SITE/current"
sudo chown -R mac:mac "$APP"
echo "current -> $NEW"

# 4. 起容器。配置没变时 compose 不会重建，nginx 走软链，内容更新无需重启。
cd "$APP"
sudo docker compose up -d

# 5. 只有 Caddy 片段变化时才 reload。Caddy 会先校验新配置，
#    校验不过则保留旧配置继续运行，不会波及其他站点。
if [ "$changed_caddy" = 1 ]; then
	sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
	echo "caddy reloaded"
fi

# 6. 清理旧版本，只留最近 $KEEP 个
cd "$SITE/releases"
sudo ls -1dt -- */ | tail -n +$((KEEP + 1)) | xargs -r sudo rm -rf

# 7. 自检：容器内直接请求首页
sudo docker exec mit-cs-notes-web wget -qO /dev/null http://localhost/
echo "deployed OK: $RELEASE"

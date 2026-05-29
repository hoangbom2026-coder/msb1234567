# MBS Daily Backup

Snapshot mỗi ngày tại `daily/YYYY-MM-DD/`:
- `database.sql.gz` — MySQL full
- `uploads.tar.gz` — file upload
- `flags.tar.gz` — cờ ngôn ngữ
- `configs.tar.gz` — .env
- `manifest.json` — checksum

**Repo PRIVATE** — chứa mật khẩu DB.

Khôi phục:
```bash
gunzip -c daily/DATE/database.sql.gz | mysql -u root -p mbays_game
tar -xzf daily/DATE/uploads.tar.gz -C /var/www/backend/src/public/
```

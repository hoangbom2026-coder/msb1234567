# MBS Daily Backup (Git)

Backup tự động hàng ngày từ VPS production.

## Nội dung mỗi snapshot (`daily/YYYY-MM-DD/`)

| File | Mô tả |
|------|--------|
| `database.sql.gz` | Full dump MySQL `mbays_game` (tables, data, routines) |
| `uploads.tar.gz` | Ảnh/file user upload |
| `flags.tar.gz` | Cờ ngôn ngữ `/flag` |
| `configs.tar.gz` | `.env`, nginx, systemd, mysql tuning |
| `manifest.json` | Checksum, số dòng từng bảng, metadata |

## Khôi phục nhanh

```bash
# Database
gunzip -c daily/2026-05-29/database.sql.gz | mysql -u root -p mbays_game

# Uploads
tar -xzf daily/2026-05-29/uploads.tar.gz -C /var/www/backend/src/public/

# Configs (xem trong archive trước khi ghi đè)
tar -xzf daily/2026-05-29/configs.tar.gz -C /tmp/restore-configs
```

## Repo private — chứa mật khẩu DB trong `configs.tar.gz`

**Không** public repo này.

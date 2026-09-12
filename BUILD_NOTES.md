# Build Notes — MyShop V1.0.0

V1.0.0 là mốc Production Ready theo blueprint. Thay đổi chính nằm ở operational readiness, không tái thiết kế business flow đã ổn định từ V0.9.0.

## Source changes

- Version bump 1.0.0.
- Health endpoint + Admin System Readiness.
- Structured/redacted server logger.
- Migration 010 release marker + operational indexes/defaults.
- Production QA script.
- Backup/verify scripts và production runbook.

## Required production order

1. Backup database.
2. Run migration 010.
3. Configure production env/domain.
4. Run all QA/build gates.
5. Deploy V1.0.0.
6. Verify `/api/health` + `/admin/system`.
7. Smoke test theo `PRODUCTION_QA_CHECKLIST.md`.

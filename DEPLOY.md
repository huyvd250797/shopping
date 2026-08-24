# Deploy Checklist — V0.1.0

1. `npm install`
2. Copy `.env.example` → `.env.local`
3. Tạo Supabase project
4. Run migration `supabase/migrations/202608240001_foundation.sql`
5. Run `supabase/seed.sql`
6. `npm run seed:admin`
7. `npm run dev` và test `/` + `/admin/login`
8. `npm run typecheck`
9. `npm run lint`
10. `npm run build`
11. Push GitHub
12. Import Vercel
13. Add env vars
14. Để **Output Directory trống**
15. Deploy preview
16. Test Admin Auth bằng tài khoản seed
17. Test mobile width 390px và desktop
18. Chỉ sau khi pass mới bắt đầu V0.2.0

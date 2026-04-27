docker build --build-arg "VITE_SERVER_BASE_URL=$(grep VITE_SERVER_BASE_URL .env | cut -d '=' -f2 | tr -d '\r')" -t tylerpham2708/okr-kpi-system-client:latest .

Lệnh copy .env vào github secret: `gh secret set FE_ENV < .env.production` (Nếu chưa đăng nhập thì chạy `gh auth login` )
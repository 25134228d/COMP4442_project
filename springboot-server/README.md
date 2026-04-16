# BuffetEase Spring Boot Server

這個資料夾是新的 Spring Boot 後端，已對應你目前前端 `src/lib/services.ts` 使用的 API 路由。

## 已完成內容

- Spring Boot + Spring Web + Spring Data JPA + MySQL Connector
- 與前端一致的 API：
  - `POST /api/auth/login`
  - `GET /api/packages/active`
  - `GET /api/packages`
  - `GET /api/packages/{id}`
  - `POST /api/packages`
  - `PUT /api/packages/{id}`
  - `DELETE /api/packages/{id}`
  - `GET /api/sessions`
  - `GET /api/sessions/package/{packageId}?date=YYYY-MM-DD`
  - `POST /api/sessions`
  - `PUT /api/sessions/{id}`
  - `GET /api/reservations`
  - `GET /api/reservations/user/{userId}`
  - `POST /api/reservations`
  - `PATCH /api/reservations/{id}/status`
- MySQL 資料連線設定（可直接用環境變數覆寫）
- CORS 已允許 `http://localhost:3000`（Vite 開發模式）
- 已放入前端 build 檔案到 `src/main/resources/static`

---

## MySQL 連線設定（之後接雲端 DB service 用）

設定檔位置：
- `src/main/resources/application.yml`

目前使用這些環境變數：
- `MYSQL_URL`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

範例：

```bash
export MYSQL_URL='jdbc:mysql://<host>:3306/buffetease?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export MYSQL_USER='your_user'
export MYSQL_PASSWORD='your_password'
```

### 你之後要接 MySQL service 的主要方法位置

- 認證建立/查詢：`AuthService.loginWithEmail()`
- 套餐資料：`PackageService`
- 場次資料：`SessionService`
- 預約資料（含容量更新）：`ReservationService`

---

## 啟動方式

### 1) 只啟動後端（直接服務前端靜態檔）

```bash
cd springboot-server
mvn spring-boot:run
```

開啟：`http://localhost:8080`

### 2) 前後端分離開發

- 後端：`http://localhost:8080`
- 前端：`npm run dev`（`http://localhost:3000`）
- 已在 Vite 設定 `/api` proxy 到 `8080`

---

## 備註

如果你修改了 React 前端，記得重新 build 並更新到 Spring Boot static：

```bash
npm run build
rm -rf springboot-server/src/main/resources/static/*
cp -r dist/* springboot-server/src/main/resources/static/
```

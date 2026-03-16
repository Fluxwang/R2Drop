# R2Drop

一个基于 Next.js App Router + NextAuth + Prisma + Cloudflare R2 的私有文件管理系统。

支持邮箱注册登录、拖拽/批量上传、文件列表管理、单个/批量下载与删除，并通过服务端鉴权确保用户只能访问自己的文件。

## 项目来源

本项目基于 [LearningR2Drop](https://github.com/Fluxwang/LearningR2Drop) 进行开发，并在此基础上做了 AI 驱动的 UI 优化。

English version: [README.md](./README.md)

## 功能特性

- 用户认证
  - 基于 `next-auth` Credentials Provider（邮箱 + 密码）
  - 支持注册、登录、登出
  - 受保护页面（`/dashboard`、`/files`）未登录自动跳转
- 文件上传
  - 通过服务端生成预签名 URL，客户端直传 Cloudflare R2
  - 支持多文件队列上传、拖拽上传、上传进度展示
- 文件管理
  - 获取当前用户文件列表（按最后修改时间倒序）
  - 单文件下载/删除
  - 批量下载/批量删除
- 安全控制
  - 所有文件操作接口都校验会话
  - 服务端校验 `key` 前缀，禁止跨用户访问
- 工程能力
  - Prisma 管理用户表与迁移
  - 支持 `HTTPS_PROXY`/`HTTP_PROXY` 网络代理

## 技术栈

- 前端：Next.js 15（App Router）、React 19、Tailwind CSS 4、DaisyUI
- 认证：NextAuth v4（Credentials）
- 存储：Cloudflare R2（S3 协议）+ AWS SDK v3
- 数据库：PostgreSQL + Prisma
- 其他：Axios（上传进度）

## 快速开始

### 1. 环境要求

- Node.js 20+
- npm 10+
- PostgreSQL（本地或云端）
- Cloudflare R2 存储桶

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env`（可参考以下模板）：

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DB?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB"

# NextAuth
NEXTAUTH_SECRET="replace-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2
R2_ENDPOINT="https://<accountid>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="<your-r2-access-key-id>"
R2_SECRET_ACCESS_KEY="<your-r2-secret-access-key>"
R2_BUCKET_NAME="<your-bucket-name>"

# Optional proxy
HTTPS_PROXY="http://127.0.0.1:7890"
# 或 HTTP_PROXY="http://127.0.0.1:7890"
```

### 4. 初始化数据库与 Prisma Client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. 启动开发环境

```bash
npm run dev
```

打开 `http://localhost:3000`，系统会重定向到登录页。

## 常用命令

```bash
npm run dev      # 启动开发环境（Turbopack）
npm run build    # 生产构建
npm run start    # 启动生产服务
npm run lint     # ESLint 检查
```

## 目录结构

```text
.
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── upload/route.ts
│   │   ├── files/route.ts
│   │   ├── download/route.ts
│   │   ├── delete/route.ts
│   │   ├── bulkdownload/route.ts
│   │   └── bulkdelete/route.ts
│   ├── dashboard/page.tsx
│   ├── files/
│   ├── login/page.tsx
│   └── register/page.tsx
├── lib/
│   ├── auth.ts              # NextAuth 配置
│   ├── r2.ts                # R2 客户端与代理支持
│   └── formatBytes.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── README.md
```

## API 概览

以下接口均为项目内置 API 路由：

### 认证

- `POST /api/register`
  - 说明：用户注册（邮箱唯一，密码加密存储）
  - Body：`{ email, password, confirmPassword }`
- `GET|POST /api/auth/[...nextauth]`
  - 说明：NextAuth 默认认证路由（登录/会话等）

### 文件

- `POST /api/upload`（需要登录）
  - 说明：生成上传预签名 URL
  - Body：`{ filename, contentType }`
  - Response：`{ url, key }`

- `GET /api/files`（需要登录）
  - 说明：获取当前用户文件列表
  - Response：`{ files, count, userEmail }`

- `POST /api/download`（需要登录）
  - 说明：生成单文件下载 URL
  - Body：`{ key }`
  - Response：`{ url }`

- `DELETE /api/delete`（需要登录）
  - 说明：删除单个文件
  - Body：`{ key }`

- `POST /api/bulkdownload`（需要登录）
  - 说明：批量生成下载 URL
  - Body：`{ keys: string[] }`
  - Response：`{ downloads: [{ key, filename, url }] }`

- `DELETE /api/bulkdelete`（需要登录）
  - 说明：批量删除文件
  - Body：`{ key: string[] }`

## 文件 Key 设计

上传文件时，服务端会将对象写入以下路径格式：

```text
uploads/{userEmail}/{uuid}/{filename}
```

该规则用于服务端权限校验，确保用户仅能操作自己的文件。

## 手动验证清单

1. 注册新用户后可成功跳转登录。
2. 登录成功后进入 `/dashboard`。
3. 上传单个/多个文件，进度条正常。
4. 在 `/files` 可看到刚上传文件。
5. 单个下载/删除可用。
6. 勾选多个文件后可批量下载/删除。
7. 未登录直接访问 `/dashboard` 或 `/files` 会被重定向到 `/login`。

## 部署说明

1. 先准备 PostgreSQL 与 R2 参数。
2. 在部署平台注入 `.env` 中同名环境变量。
3. 执行数据库迁移：

```bash
npx prisma migrate deploy
```

4. 构建并启动：

```bash
npm run build
npm run start
```

## 常见问题

- 启动时报 `R2 环境变量配置不当`
  - 检查 `R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_BUCKET_NAME`。
- 上传或拉取对象超时
  - 配置 `HTTPS_PROXY` 或检查网络可达性。
- 登录态异常
  - 检查 `NEXTAUTH_SECRET`、`NEXTAUTH_URL` 是否正确。
- Prisma 迁移失败
  - 确认 `DATABASE_URL`（连接池）与 `DIRECT_URL`（直连）配置正确。

## License

仅供学习与内部项目参考，如需开源发布请补充明确许可证。

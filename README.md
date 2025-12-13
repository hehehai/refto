# refto-one

基于 [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) 构建的现代全栈 TypeScript 应用。

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 19, TanStack Start (SSR), TanStack Router |
| **样式** | Tailwind CSS v4, shadcn/ui (base-nova) |
| **API 层** | oRPC (端到端类型安全 RPC) |
| **数据库** | PostgreSQL + Drizzle ORM |
| **认证** | Better Auth (邮箱/密码, GitHub, Google OAuth) |
| **邮件** | React Email + Resend |
| **代码质量** | Biome + Ultracite |
| **包管理** | pnpm (monorepo workspaces) |

## 项目结构

```
refto-one/
├── apps/
│   └── web/                      # 全栈应用 (端口 3001)
│       └── src/
│           ├── routes/           # 文件路由
│           │   ├── (auth)/       # 认证页面 (登录/注册/重置密码)
│           │   ├── (app)/        # 受保护的应用路由
│           │   ├── (admin)/      # 管理后台路由
│           │   └── api/          # API 路由处理
│           ├── components/
│           │   ├── ui/           # shadcn/ui 组件
│           │   ├── shared/       # 共享组件
│           │   └── features/     # 功能组件
│           ├── lib/              # 工具库 (auth-client, utils)
│           ├── hooks/            # 自定义 Hooks
│           └── utils/            # 工具函数 (orpc 客户端)
│
├── packages/
│   ├── api/                      # oRPC 路由和业务逻辑
│   ├── auth/                     # Better Auth 配置
│   ├── db/                       # Drizzle 数据库 schema
│   ├── email/                    # React Email 邮件模板
│   └── config/                   # 共享 TypeScript 配置
```

## 安装

### 前置要求

- Node.js 20+
- pnpm 10+
- PostgreSQL 数据库

### 步骤

1. 克隆仓库并安装依赖：

```bash
git clone <repo-url>
cd refto-one
pnpm install
```

2. 配置环境变量：

```bash
cp apps/web/.env.example apps/web/.env
```

编辑 `apps/web/.env`：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/refto_one"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"

# OAuth (可选)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# 邮件 (可选)
RESEND_API_KEY=""
```

3. 初始化数据库：

```bash
pnpm run db:push
```

## 开发

启动开发服务器：

```bash
pnpm run dev
```

访问 [http://localhost:3001](http://localhost:3001)

### 常用命令

```bash
# 开发
pnpm run dev          # 启动所有应用
pnpm run dev:web      # 仅启动 web 应用

# 类型检查
pnpm run check-types  # 检查所有包的 TypeScript 类型

# 代码质量
pnpm run check        # Biome 格式化和检查
npx ultracite fix     # 自动修复代码问题

# 数据库
pnpm run db:push      # 推送 schema 变更到数据库
pnpm run db:generate  # 生成迁移文件
pnpm run db:migrate   # 执行迁移
pnpm run db:studio    # 打开 Drizzle Studio
```

## 构建

```bash
pnpm run build
```

构建产物位于 `apps/web/.output/`

## 部署

### 环境变量

生产环境需要配置以下环境变量：

- `DATABASE_URL` - PostgreSQL 连接字符串
- `BETTER_AUTH_SECRET` - 认证密钥 (建议 32+ 字符)
- `BETTER_AUTH_URL` - 生产环境 URL
- `CORS_ORIGIN` - 允许的跨域来源
- OAuth 和邮件服务的相关密钥

### 部署平台

项目基于 TanStack Start 构建，支持部署到：

- **Node.js 服务器** - 直接运行构建产物
- **Docker** - 容器化部署
- **Vercel / Netlify** - 需要适配器配置
- **Cloudflare Workers** - 需要适配器配置

### Docker 部署示例

```dockerfile
FROM node:20-slim AS base
RUN corepack enable pnpm

FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS production
WORKDIR /app
COPY --from=build /app/apps/web/.output .output
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
```

## License

MIT

# 运动打卡 - Cloudflare 部署指南

## 前置条件

- Node.js >= 18
- Cloudflare 账号（[注册地址](https://dash.cloudflare.com/sign-up)）
- Wrangler CLI（已包含在 devDependencies 中）

## 1. 安装依赖

```bash
cd cloudflare
npm install
```

## 2. 登录 Cloudflare

```bash
npx wrangler login
```

浏览器会自动打开授权页面，点击允许即可。

## 3. 创建 D1 数据库

```bash
npm run db:create
```

命令输出示例：

```
✅ Successfully created DB 'fitness-checkin'

database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

将输出的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fitness-checkin"
database_id = "替换为你的实际 ID"
```

## 4. 执行数据库迁移

```bash
# 远程（生产环境）
npm run db:migrate:prod

# 本地（开发环境）
npm run db:migrate
```

## 5. 配置环境变量（可选）

为生产环境设置 JWT 密钥：

```bash
npx wrangler secret put JWT_SECRET
```

按提示输入一个随机字符串。不设置则使用内置默认值，仅建议开发时使用。

## 6. 部署

```bash
npm run deploy
```

该命令会自动执行 `vite build` 构建前端，然后通过 `wrangler deploy` 将 Worker + 静态资源一起部署。

部署成功后终端会输出访问地址，格式为：

```
https://fitness-checkin.<你的子域名>.workers.dev
```

## 7. 自定义域名（可选）

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/) > Workers & Pages
2. 找到 `fitness-checkin` 项目，点击进入
3. Settings > Domains & Routes > Add > Custom Domain
4. 输入你的域名（该域名的 DNS 需托管在 Cloudflare）

## 本地开发

需要两个终端窗口分别启动：

```bash
# 终端 1：启动 Worker（端口 8787）
npx wrangler dev

# 终端 2：启动前端（端口 5173，自动代理 /api 到 8787）
npm run dev
```

浏览器访问 `http://localhost:5173`。

## 项目结构

```
cloudflare/
├── worker/                 # Cloudflare Worker 后端
│   ├── index.ts            # Hono 入口
│   ├── types.ts            # 环境绑定类型
│   ├── lib/
│   │   ├── jwt.ts          # JWT (jose)
│   │   └── password.ts     # 密码哈希 (Web Crypto PBKDF2)
│   ├── middleware/
│   │   └── auth.ts         # 认证中间件
│   └── routes/
│       ├── auth.ts         # 注册/登录
│       ├── checkins.ts     # 打卡
│       └── stats.ts        # 统计
├── src/                    # React 前端
├── migrations/             # D1 数据库迁移文件
├── wrangler.toml           # Cloudflare 配置
├── vite.config.ts          # Vite 配置
└── package.json
```

## 技术栈

| 层级     | 技术                        |
| -------- | --------------------------- |
| 前端框架 | React 18 + TypeScript       |
| 构建工具 | Vite                        |
| 样式     | Tailwind CSS                |
| 图表     | Recharts                    |
| 后端框架 | Hono                        |
| 数据库   | Cloudflare D1 (SQLite)      |
| 认证     | JWT (jose)                  |
| 密码哈希 | Web Crypto PBKDF2           |
| 部署平台 | Cloudflare Workers + Assets |

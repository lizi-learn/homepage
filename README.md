# 我的书签 - Cloudflare Workers

一个基于 Cloudflare Workers 的现代化书签页面，支持链接状态检测、在线编辑和KV存储。

## ✨ 功能特性

- 🎨 **美观的毛玻璃效果界面** - 现代化的 UI 设计，支持毛玻璃（Glassmorphism）效果
- 🖼️ **微软 Bing 随机图片背景** - 每次打开页面都会加载随机的 Bing 每日图片作为背景
- 🔍 **实时链接状态检测** - 自动检测所有链接的在线状态，显示绿色圆点和延迟时间
- ✏️ **前端在线编辑** - 点击右下角编辑按钮即可添加、修改、删除链接
- 💾 **KV存储持久化** - 使用 Cloudflare KV 存储，数据安全可靠
- 📱 **响应式设计** - 完美适配桌面和移动设备，居中展示
- ⚡ **自动状态检测** - 页面加载时自动检测所有链接状态，每5分钟自动刷新

## 快速开始

### 1. 安装依赖

```bash
npm install
```

如果没有安装 wrangler，需要先全局安装：

```bash
npm install -g wrangler
```

### 2. 配置 KV 命名空间

有两种方式配置 KV 命名空间：

#### 方式一：自动创建（推荐）

如果你已经登录了 Cloudflare（`wrangler login`），可以运行：

```bash
npm run setup-kv
```

或者：

```bash
node setup-kv.js
```

脚本会自动创建 KV 命名空间并更新 `wrangler.toml` 文件。

#### 方式二：使用已有的 Global ID

如果你已经有 KV 命名空间的 global id，可以直接使用：

```bash
npm run setup-kv:id YOUR_GLOBAL_ID
```

或者：

```bash
node setup-kv.js --id YOUR_GLOBAL_ID
```

#### 方式三：手动创建

如果你想手动创建：

```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "LINKS"

# 创建预览环境 KV 命名空间  
wrangler kv:namespace create "LINKS" --preview
```

然后将返回的 ID 手动更新到 `wrangler.toml` 文件中。

### 3. 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器让你登录 Cloudflare 账号。

### 4. 本地开发测试

```bash
npm run dev
```

或者：

```bash
wrangler dev
```

### 5. 部署到 Cloudflare

#### 方式一：一键部署脚本（推荐）

```bash
./deploy.sh
```

或者使用 npm：

```bash
npm run deploy:quick
```

#### 方式二：使用 npm 脚本

```bash
npm run deploy
```

#### 方式三：直接使用 wrangler

```bash
wrangler deploy
```

部署成功后，你会得到一个 Workers URL，例如：`https://self-homepage.your-subdomain.workers.dev`

## 💡 使用提示

- **编辑链接**：点击右下角的 ✏️ 图标按钮打开编辑界面
- **自动保存**：编辑后点击"保存"按钮，数据会立即保存到 Cloudflare KV 存储
- **URL 验证**：系统会自动验证 URL 格式，无效的链接会被过滤
- **自动补全**：如果输入的 URL 没有协议前缀，系统会自动添加 `https://`

## 🔧 代码更新部署

### 快速部署

修改代码后，使用一键部署脚本：

```bash
./deploy.sh
```

或者：

```bash
npm run deploy:quick
```

脚本会自动：
- ✅ 检查登录状态
- ✅ 验证配置文件
- ✅ 执行部署
- ✅ 显示部署结果

### 其他部署方式

```bash
# 使用 npm
npm run deploy

# 直接使用 wrangler
wrangler deploy
```

**注意**：
- 编辑链接数据不需要重新部署，数据会直接保存到 KV 存储中
- 只有修改了代码（`src/index.js`）才需要重新部署

## 配置说明

### wrangler.toml

需要更新 KV 命名空间的 ID：

```toml
[[kv_namespaces]]
binding = "LINKS"
id = "你的生产环境KV命名空间ID"
preview_id = "你的预览环境KV命名空间ID"
```

## 📖 使用方法

### 基本操作

1. **访问页面** - 打开部署后的 Workers URL
2. **查看链接** - 页面会自动加载并显示所有保存的链接
3. **查看状态** - 每个链接旁边会显示在线状态：
   - 🟢 **绿色圆点** - 链接在线，显示延迟时间（ms）
   - ⚪ **灰色圆点** - 链接离线或无法访问
4. **编辑链接** - 点击右下角的 ✏️ 编辑按钮：
   - 添加新链接：点击"添加链接"按钮
   - 修改链接：直接编辑名称或 URL
   - 删除链接：点击"删除"按钮
   - 保存更改：点击"保存"按钮

### 链接格式

- **链接名称**：显示在界面上的文字
- **URL 地址**：完整的网址（会自动添加 https:// 前缀）

### 自动功能

- ⚡ 页面加载时自动检测所有链接状态
- 🔄 每 5 分钟自动刷新链接状态
- 💾 保存后立即生效，无需刷新页面

## 🛠️ 技术栈

- **Cloudflare Workers** - 边缘计算平台，全球 CDN 加速
- **Cloudflare KV** - 键值存储，持久化数据
- **HTML/CSS/JavaScript** - 纯前端实现，无需框架
- **Glassmorphism** - 毛玻璃效果（backdrop-filter）
- **Bing Image API** - 微软 Bing 每日图片

## 📝 项目结构

```
self-homepage/
├── src/
│   └── index.js          # Workers 主文件（包含前端代码）
├── wrangler.toml         # Cloudflare Workers 配置
├── package.json          # 项目依赖配置
├── setup-kv.js          # KV 命名空间自动配置脚本
└── README.md            # 项目文档
```

## 🚀 快速部署

1. **克隆或下载项目**
2. **安装依赖**：`npm install`
3. **配置 KV**：`npm run setup-kv` 或使用已有 ID
4. **登录 Cloudflare**：`wrangler login`
5. **部署**：`npm run deploy`

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！


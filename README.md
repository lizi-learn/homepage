# 我的书签 - Cloudflare Workers

基于 Cloudflare Workers 的现代化书签页面，支持链接状态检测、在线编辑和 KV 存储。

## ✨ 功能特性

- 🎨 毛玻璃效果界面 + 微软 Bing 随机图片背景
- 🔍 实时链接状态检测（自动显示在线状态和延迟）
- ✏️ 前端在线编辑（点击右下角 ✏️ 按钮）
- 💾 KV 存储持久化
- ⚡ 自动检测（页面加载时 + 每 5 分钟刷新）

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 KV 命名空间

```bash
# 自动创建（推荐）
npm run setup-kv

# 或使用已有 ID
npm run setup-kv:id YOUR_GLOBAL_ID
```

### 3. 登录并部署

```bash
# 登录 Cloudflare
wrangler login

# 一键部署
./deploy.sh
```

## 📖 使用方法

- **编辑链接**：点击右下角 ✏️ 按钮
- **查看状态**：🟢 绿色圆点 = 在线（显示延迟），⚪ 灰色 = 离线
- **点击链接**：点击链接项的大部分区域即可打开

## 🔧 更新代码

修改代码后运行：

```bash
./deploy.sh
```

**注意**：编辑链接数据不需要重新部署，数据会直接保存到 KV 存储。

## 📝 项目结构

```
self-homepage/
├── src/index.js      # Workers 主文件
├── wrangler.toml     # 配置文件
├── deploy.sh         # 一键部署脚本
└── setup-kv.js       # KV 配置脚本
```


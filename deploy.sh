#!/bin/bash

# 一键部署脚本
# 使用方法: ./deploy.sh

# 不立即退出，让我们自己处理错误
set +e

echo "🚀 开始部署到 Cloudflare Workers..."
echo ""

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ 错误: 未找到 wrangler 或 npx"
    echo "请先安装: npm install"
    exit 1
fi

# 检查是否登录
echo "📋 检查登录状态..."
if command -v wrangler &> /dev/null; then
    WRANGLER_CMD="wrangler"
else
    WRANGLER_CMD="npx wrangler"
fi

# 尝试检查登录状态（静默模式）
if ! $WRANGLER_CMD whoami &> /dev/null 2>&1; then
    echo "⚠️  未登录 Cloudflare，正在尝试登录..."
    $WRANGLER_CMD login
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败，请手动运行: $WRANGLER_CMD login"
        exit 1
    fi
fi

# 显示当前用户
echo "👤 当前用户:"
$WRANGLER_CMD whoami
echo ""

# 检查配置文件
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 错误: 未找到 wrangler.toml 配置文件"
    exit 1
fi

if [ ! -f "src/index.js" ]; then
    echo "❌ 错误: 未找到 src/index.js 文件"
    exit 1
fi

# 部署
echo "📦 正在部署..."
echo ""

# 执行部署并捕获输出
DEPLOY_OUTPUT=$($WRANGLER_CMD deploy 2>&1)
DEPLOY_STATUS=$?

# 显示部署输出
echo "$DEPLOY_OUTPUT"

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    
    # 从部署输出中提取 URL
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*\.workers\.dev' | head -1)
    
    if [ -n "$DEPLOY_URL" ]; then
        echo "🌐 访问地址: $DEPLOY_URL"
    else
        echo "🌐 请查看上面的部署输出获取访问地址"
    fi
    echo ""
else
    echo ""
    echo "❌ 部署失败！"
    exit 1
fi


#!/bin/bash

# GitHub 部署脚本
# 使用方法: ./deploy-github.sh

set +e

echo "🚀 开始部署到 GitHub..."
echo ""

# 检查 git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未找到 git"
    echo "请先安装 git"
    exit 1
fi

# 检查是否在 git 仓库中
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "📝 添加文件..."
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo "ℹ️  没有更改需要提交"
    exit 0
fi

# 提交更改
echo "💾 提交更改..."
COMMIT_MSG=${1:-"Update homepage"}
git commit -m "$COMMIT_MSG"

# 检查远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  未设置远程仓库"
    echo "请先运行: git remote add origin <your-repo-url>"
    exit 1
fi

# 推送
echo "📤 推送到 GitHub..."
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
git push -u origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
else
    echo ""
    echo "❌ 部署失败！"
    exit 1
fi
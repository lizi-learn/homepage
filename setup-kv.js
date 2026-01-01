#!/usr/bin/env node

/**
 * 自动创建 KV 命名空间并更新 wrangler.toml
 * 使用方法：
 * 1. 如果你已有 global id: node setup-kv.js --id YOUR_GLOBAL_ID
 * 2. 自动创建: node setup-kv.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WRANGLER_TOML = path.join(__dirname, 'wrangler.toml');

function updateWranglerToml(productionId, previewId) {
  let content = fs.readFileSync(WRANGLER_TOML, 'utf-8');
  
  // 更新 KV 命名空间 ID
  content = content.replace(
    /id = "your-kv-namespace-id"/,
    `id = "${productionId}"`
  );
  
  if (previewId) {
    content = content.replace(
      /preview_id = "your-kv-preview-id"/,
      `preview_id = "${previewId}"`
    );
  } else {
    // 如果没有 preview_id，使用相同的 id
    content = content.replace(
      /preview_id = "your-kv-preview-id"/,
      `preview_id = "${productionId}"`
    );
  }
  
  fs.writeFileSync(WRANGLER_TOML, content, 'utf-8');
  console.log('✅ wrangler.toml 已更新！');
}

function createKVNamespace(isPreview = false) {
  try {
    const command = isPreview 
      ? 'wrangler kv:namespace create "LINKS" --preview'
      : 'wrangler kv:namespace create "LINKS"';
    
    console.log(`正在创建 ${isPreview ? '预览' : '生产'}环境 KV 命名空间...`);
    const output = execSync(command, { encoding: 'utf-8' });
    
    // 从输出中提取 ID
    const match = output.match(/id = "([^"]+)"/);
    if (match) {
      return match[1];
    }
    
    // 尝试另一种格式
    const match2 = output.match(/id:\s*"([^"]+)"/);
    if (match2) {
      return match2[1];
    }
    
    throw new Error('无法从输出中提取 ID');
  } catch (error) {
    console.error(`❌ 创建 KV 命名空间失败:`, error.message);
    throw error;
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  // 如果提供了 global id
  if (args.includes('--id') || args.includes('-i')) {
    const idIndex = args.findIndex(arg => arg === '--id' || arg === '-i');
    const globalId = args[idIndex + 1];
    
    if (!globalId) {
      console.error('❌ 请提供 global id: node setup-kv.js --id YOUR_GLOBAL_ID');
      process.exit(1);
    }
    
    console.log(`使用提供的 global id: ${globalId}`);
    updateWranglerToml(globalId, globalId);
    console.log('✅ 配置完成！');
    return;
  }
  
  // 自动创建
  console.log('🚀 开始自动创建 KV 命名空间...\n');
  
  try {
    const productionId = createKVNamespace(false);
    console.log(`✅ 生产环境 KV 命名空间 ID: ${productionId}\n`);
    
    let previewId;
    try {
      previewId = createKVNamespace(true);
      console.log(`✅ 预览环境 KV 命名空间 ID: ${previewId}\n`);
    } catch (error) {
      console.log('⚠️  预览环境创建失败，使用生产环境 ID\n');
      previewId = productionId;
    }
    
    updateWranglerToml(productionId, previewId);
    console.log('\n✅ 所有配置完成！');
    console.log('\n现在可以运行: wrangler deploy');
    
  } catch (error) {
    console.error('\n❌ 配置失败，请确保：');
    console.error('1. 已安装 wrangler: npm install -g wrangler');
    console.error('2. 已登录 Cloudflare: wrangler login');
    console.error('3. 或者使用已有 ID: node setup-kv.js --id YOUR_GLOBAL_ID');
    process.exit(1);
  }
}

main();


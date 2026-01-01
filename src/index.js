export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 处理API请求
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // 返回前端页面
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

// API处理函数
async function handleAPI(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  
  // 获取所有链接
  if (url.pathname === '/api/links' && method === 'GET') {
    const linksJson = await env.LINKS.get('links');
    const links = linksJson ? JSON.parse(linksJson) : [];
    return new Response(JSON.stringify(links), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // 保存链接
  if (url.pathname === '/api/links' && method === 'POST') {
    const links = await request.json();
    await env.LINKS.put('links', JSON.stringify(links));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Ping检测
  if (url.pathname === '/api/ping' && method === 'POST') {
    const { url: targetUrl } = await request.json();
    
    // 尝试检测网站是否可访问
    // 先尝试 HEAD（更快），失败则尝试 GET（更兼容）
    const tryFetch = async (method, url) => {
      const startTime = Date.now();
      try {
        const response = await fetch(url, {
          method: method,
          signal: AbortSignal.timeout(10000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BookmarkChecker/1.0)',
          },
        });
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        // 状态码 200-499 都认为网站可访问（包括重定向、403等）
        // 只有 500+ 或网络错误才认为离线
        if (response.status >= 200 && response.status < 500) {
          return { success: true, latency, status: response.status };
        }
        return { success: false, error: `HTTP ${response.status}` };
      } catch (error) {
        const endTime = Date.now();
        return { success: false, error: error.message, latency: endTime - startTime };
      }
    };
    
    // 先尝试 HEAD
    const headResult = await tryFetch('HEAD', targetUrl);
    if (headResult.success) {
      return new Response(JSON.stringify(headResult), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // HEAD 失败，尝试 GET
    const getResult = await tryFetch('GET', targetUrl);
    return new Response(JSON.stringify(getResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// HTML模板
function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的书签</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      position: relative;
    }
    
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 0;
    }
    
    .container {
      position: relative;
      z-index: 1;
      width: 90%;
      max-width: 800px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    
    h1 {
      text-align: center;
      color: white;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .edit-fab {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .edit-fab:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
    }
    
    .edit-fab:active {
      transform: scale(0.95);
    }
    
    .edit-fab::before {
      content: '✏️';
      font-size: 24px;
    }
    
    .links-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .link-item {
      display: flex;
      align-items: center;
      position: relative;
      padding: 15px 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: all 0.3s;
      cursor: pointer;
    }
    
    .link-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(5px);
    }
    
    .link-info {
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0;
      padding-right: 120px;
    }
    
    .link-name {
      color: white;
      font-size: 18px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.3s;
      display: block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .link-item:hover .link-name {
      color: #4CAF50;
    }
    
    .status {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      pointer-events: none;
      flex-shrink: 0;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ccc;
    }
    
    .status-dot.online {
      background: #4CAF50;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }
    
    .status-text {
      color: white;
    }
    
    .latency {
      color: #4CAF50;
      font-weight: bold;
    }
    
    .link-actions {
      display: flex;
      gap: 10px;
    }
    
    .btn-small {
      padding: 5px 10px;
      font-size: 12px;
    }
    
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      z-index: 1000;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .modal.active {
      display: flex;
      opacity: 1;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .modal-content {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(30px);
      padding: 40px;
      border-radius: 24px;
      width: 90%;
      max-width: 600px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .modal.active .modal-content {
      transform: scale(1);
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(20px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid rgba(0, 0, 0, 0.05);
    }
    
    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #666;
      transition: all 0.3s;
    }
    
    .close-btn:hover {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
      transform: rotate(90deg);
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
      font-size: 14px;
    }
    
    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.3s;
      background: #fff;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .link-edit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-radius: 16px;
      margin-bottom: 12px;
      border: 2px solid rgba(102, 126, 234, 0.1);
      transition: all 0.3s;
      position: relative;
    }
    
    .link-edit-item:hover {
      border-color: rgba(102, 126, 234, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }
    
    .link-edit-item input {
      flex: 1;
      border: 2px solid transparent;
      background: rgba(255, 255, 255, 0.8);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .link-edit-item input:focus {
      border-color: #667eea;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .link-edit-item .delete-btn {
      padding: 8px 16px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(238, 90, 111, 0.3);
    }
    
    .link-edit-item .delete-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(238, 90, 111, 0.4);
    }
    
    .link-edit-item .delete-btn:active {
      transform: translateY(0);
    }
    
    .edit-links-container {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 8px;
      margin-bottom: 20px;
    }
    
    .edit-links-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .edit-links-container::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 10px;
    }
    
    .edit-links-container::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
    }
    
    .add-link-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 24px;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .add-link-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
    }
    
    .add-link-btn:active {
      transform: translateY(0);
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 2px solid rgba(0, 0, 0, 0.05);
    }
    
    .modal-actions .btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      min-width: 100px;
    }
    
    .modal-actions .btn-cancel {
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      color: #666;
    }
    
    .modal-actions .btn-cancel:hover {
      background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
      transform: translateY(-2px);
    }
    
    .modal-actions .btn-save {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }
    
    .modal-actions .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }
    
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .loading {
      text-align: center;
      color: white;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>我的书签</h1>
    
    <div class="links-container" id="linksContainer">
      <div class="loading">加载中...</div>
    </div>
  </div>
  
  <!-- 右下角编辑按钮 -->
  <button class="edit-fab" onclick="openEditModal()" title="编辑链接"></button>
  
  <!-- 编辑模态框 -->
  <div class="modal" id="editModal" onclick="if(event.target===this) closeEditModal()">
    <div class="modal-content">
      <div class="modal-header">
        <h2>编辑链接</h2>
        <button class="close-btn" onclick="closeEditModal()" title="关闭">×</button>
      </div>
      <div class="edit-links-container" id="editLinksContainer">
        <div class="empty-state">
          <div class="empty-state-icon">🔗</div>
          <p>暂无链接，点击下方按钮添加</p>
        </div>
      </div>
      <button class="add-link-btn" onclick="addLinkField()">
        <span>+</span> 添加链接
      </button>
      <div class="modal-actions">
        <button class="btn btn-cancel" onclick="closeEditModal()">取消</button>
        <button class="btn btn-save" onclick="saveLinks()">保存</button>
      </div>
    </div>
  </div>
  
  <script>
    let links = [];
    
    // 加载Bing背景图片
    async function loadBingBackground() {
      try {
        const idx = Math.floor(Math.random() * 7);
        const response = await fetch(\`https://www.bing.com/HPImageArchive.aspx?format=js&idx=\${idx}&n=1&mkt=zh-CN\`);
        const data = await response.json();
        if (data.images && data.images[0]) {
          const imageUrl = 'https://www.bing.com' + data.images[0].url;
          document.body.style.backgroundImage = \`url('\${imageUrl}')\`;
        }
      } catch (error) {
        console.error('加载背景图片失败:', error);
        // 使用默认背景
        document.body.style.backgroundImage = 'url(https://picsum.photos/1920/1080?random=' + Date.now() + ')';
      }
    }
    
    // 加载链接
    async function loadLinks() {
      try {
        const response = await fetch('/api/links');
        links = await response.json();
        renderLinks();
        checkAllLinks();
      } catch (error) {
        console.error('加载链接失败:', error);
      }
    }
    
    // 渲染链接
    function renderLinks() {
      const container = document.getElementById('linksContainer');
      if (links.length === 0) {
        container.innerHTML = '<div class="loading">暂无链接</div>';
        return;
      }
      
      container.innerHTML = links.map(link => \`
        <a href="\${link.url}" target="_blank" class="link-item">
          <div class="link-info">
            <span class="link-name">\${link.name}</span>
          </div>
          <div class="status">
            <div class="status-dot" id="status-\${link.id}"></div>
            <span class="status-text" id="statusText-\${link.id}">检测中...</span>
          </div>
        </a>
      \`).join('');
    }
    
    // 检测单个链接
    async function checkLink(link) {
      const statusDot = document.getElementById(\`status-\${link.id}\`);
      const statusText = document.getElementById(\`statusText-\${link.id}\`);
      
      if (!statusDot || !statusText) return;
      
      try {
        const startTime = Date.now();
        const response = await fetch('/api/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: link.url }),
        });
        const result = await response.json();
        const endTime = Date.now();
        
        if (result.success) {
          statusDot.classList.add('online');
          statusText.innerHTML = \`<span class="latency">\${result.latency}ms</span>\`;
        } else {
          statusDot.classList.remove('online');
          statusText.textContent = '离线';
        }
      } catch (error) {
        statusDot.classList.remove('online');
        statusText.textContent = '错误';
      }
    }
    
    // 检测所有链接
    async function checkAllLinks() {
      const container = document.getElementById('linksContainer');
      const loadingDiv = container.querySelector('.loading');
      if (loadingDiv) {
        loadingDiv.textContent = '检测中...';
      }
      
      for (const link of links) {
        await checkLink(link);
        await new Promise(resolve => setTimeout(resolve, 500)); // 避免请求过快
      }
      
      if (loadingDiv) {
        loadingDiv.remove();
      }
    }
    
    // 打开编辑模态框
    function openEditModal() {
      const modal = document.getElementById('editModal');
      const container = document.getElementById('editLinksContainer');
      
      if (links.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="empty-state-icon">🔗</div>
            <p>暂无链接，点击下方按钮添加</p>
          </div>
        \`;
      } else {
        container.innerHTML = links.map((link, index) => \`
          <div class="link-edit-item" data-index="\${index}">
            <input type="text" placeholder="链接名称" value="\${link.name || ''}" onchange="updateLinkField(\${index}, 'name', this.value)" oninput="updateLinkField(\${index}, 'name', this.value)">
            <input type="text" placeholder="https://example.com" value="\${link.url || ''}" onchange="updateLinkField(\${index}, 'url', this.value)" oninput="updateLinkField(\${index}, 'url', this.value)">
            <button class="delete-btn" onclick="removeLinkField(\${index})" title="删除">删除</button>
          </div>
        \`).join('');
      }
      
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    // 关闭编辑模态框
    function closeEditModal() {
      const modal = document.getElementById('editModal');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // 更新链接字段
    function updateLinkField(index, field, value) {
      if (!links[index]) {
        links[index] = { id: Date.now().toString(), name: '', url: '' };
      }
      links[index][field] = value;
    }
    
    // 添加链接字段
    function addLinkField() {
      const container = document.getElementById('editLinksContainer');
      const newId = Date.now().toString();
      links.push({ id: newId, name: '', url: '' });
      
      // 清除空状态
      const emptyState = container.querySelector('.empty-state');
      if (emptyState) {
        emptyState.remove();
      }
      
      const div = document.createElement('div');
      div.className = 'link-edit-item';
      div.setAttribute('data-index', links.length - 1);
      div.innerHTML = \`
        <input type="text" placeholder="链接名称" onchange="updateLinkField(\${links.length - 1}, 'name', this.value)" oninput="updateLinkField(\${links.length - 1}, 'name', this.value)">
        <input type="text" placeholder="https://example.com" onchange="updateLinkField(\${links.length - 1}, 'url', this.value)" oninput="updateLinkField(\${links.length - 1}, 'url', this.value)">
        <button class="delete-btn" onclick="removeLinkField(\${links.length - 1})" title="删除">删除</button>
      \`;
      container.appendChild(div);
      
      // 滚动到底部并聚焦第一个输入框
      container.scrollTop = container.scrollHeight;
      div.querySelector('input').focus();
    }
    
    // 删除链接字段
    function removeLinkField(index) {
      if (confirm('确定要删除这个链接吗？')) {
        links.splice(index, 1);
        openEditModal(); // 重新渲染
      }
    }
    
    // 保存链接
    async function saveLinks() {
      // 过滤空链接并验证URL格式
      links = links.filter(link => {
        if (!link.name || !link.url) return false;
        // 简单的URL验证
        try {
          new URL(link.url);
          return true;
        } catch {
          // 如果不是完整URL，尝试添加https://
          if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
            link.url = 'https://' + link.url;
          }
          try {
            new URL(link.url);
            return true;
          } catch {
            return false;
          }
        }
      });
      
      if (links.length === 0) {
        alert('请至少添加一个有效的链接！');
        return;
      }
      
      try {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(links),
        });
        
        if (response.ok) {
          // 使用更友好的提示
          const saveBtn = document.querySelector('.btn-save');
          const originalText = saveBtn.textContent;
          saveBtn.textContent = '✓ 保存成功';
          saveBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
          
          setTimeout(() => {
            closeEditModal();
            loadLinks();
            saveBtn.textContent = originalText;
            saveBtn.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
          }, 800);
        } else {
          alert('保存失败，请重试！');
        }
      } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + error.message);
      }
    }
    
    
    // 页面加载时初始化
    loadBingBackground();
    loadLinks();
    
    // 定期检测链接状态（每5分钟）
    setInterval(checkAllLinks, 5 * 60 * 1000);
  </script>
</body>
</html>`;
}


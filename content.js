let qrContainer = null;
let isDragging = false;
let startX, startY, startLeft, startTop;

function getFaviconUrl() {
  let favicon = document.querySelector('link[rel="shortcut icon"]') ||
                document.querySelector('link[rel="icon"]');
  if (favicon) return favicon.href;
  return 'https://www.google.com/s2/favicons?domain=' + window.location.hostname;
}

function createQRCode() {
  if (qrContainer) return;

  const url = window.location.href;
  qrContainer = document.createElement('div');
  qrContainer.id = 'qr-container-extension';
  
  // 创建一个容器来放置二维码和图标
  const qrWrapper = document.createElement('div');
  qrWrapper.style.position = 'relative';
  qrContainer.appendChild(qrWrapper);

  // 使用qrcode.js库生成二维码
  const qrcode = new QRCode(qrWrapper, {
    text: url,
    width: 128,
    height: 128,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  
  // 创建并添加网站图标
  const iconImg = document.createElement('img');
  iconImg.src = getFaviconUrl();
  iconImg.style.position = 'absolute';
  iconImg.style.top = '50%';
  iconImg.style.left = '50%';
  iconImg.style.transform = 'translate(-50%, -50%)';
  iconImg.style.width = '20%';
  iconImg.style.height = '20%';
  iconImg.style.borderRadius = '50%';
  iconImg.style.backgroundColor = 'white';
  iconImg.style.padding = '2px';
  qrWrapper.appendChild(iconImg);
  
  const urlText = document.createElement('p');
  urlText.textContent = url;
  urlText.style.margin = '10px 0 0 0';
  urlText.style.fontSize = '12px';
  urlText.style.wordBreak = 'break-all';
  urlText.style.maxWidth = '200px';
  
  qrContainer.appendChild(urlText);
  
  // 使用固定定位，并确保不影响其他元素
  Object.assign(qrContainer.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '2147483647',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'none',
    width: 'auto',
    height: 'auto',
    margin: '0',
    textAlign: 'center',
    cursor: 'move'
  });
  
  document.body.appendChild(qrContainer);

  // 添加拖拽功能
  qrContainer.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
}

function startDragging(e) {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startLeft = qrContainer.offsetLeft;
  startTop = qrContainer.offsetTop;
  qrContainer.style.transition = 'none';
}

function drag(e) {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  qrContainer.style.left = `${startLeft + dx}px`;
  qrContainer.style.top = `${startTop + dy}px`;
  qrContainer.style.right = 'auto';
  qrContainer.style.bottom = 'auto';
}

function stopDragging() {
  isDragging = false;
  qrContainer.style.transition = 'all 0.3s ease';
}

function toggleQRCode(enabled) {
  if (enabled) {
    if (!qrContainer) {
      createQRCode();
    }
    qrContainer.style.display = 'block';
    // 重置位置
    qrContainer.style.left = 'auto';
    qrContainer.style.top = 'auto';
    qrContainer.style.right = '20px';
    qrContainer.style.bottom = '20px';
  } else if (qrContainer) {
    qrContainer.style.display = 'none';
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleQRCode") {
    toggleQRCode(request.enabled);
    sendResponse({received: true});  // 发送响应
  }
  return true;  // 表示异步发送响应
});

// 在页面加载时检查是否应该显示二维码
chrome.storage.sync.get('qrCodeEnabled', function(data) {
  toggleQRCode(data.qrCodeEnabled);
});
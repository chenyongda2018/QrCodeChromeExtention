document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('qrToggle');

  // 检查 chrome.storage 是否可用
  if (chrome.storage && chrome.storage.sync) {
    // 从存储中获取当前状态
    chrome.storage.sync.get('qrCodeEnabled', function(data) {
      toggleSwitch.checked = data.qrCodeEnabled || false;
    });

    toggleSwitch.addEventListener('change', function() {
      const isEnabled = toggleSwitch.checked;
      
      // 保存状态到存储
      chrome.storage.sync.set({qrCodeEnabled: isEnabled});

      // 向所有标签页发送消息
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(tab) {
          chrome.tabs.sendMessage(tab.id, {action: "toggleQRCode", enabled: isEnabled}, function(response) {
            if (chrome.runtime.lastError) {
              console.log("Could not establish connection: ", chrome.runtime.lastError.message);
            } else if (response) {
              console.log("Message received by content script in tab: " + tab.id);
            }
          });
        });
      });
    });
  } else {
    console.error('chrome.storage.sync is not available');
    document.body.innerHTML = '<p>Error: Storage permission is not available. Please check the extension permissions.</p>';
  }
});
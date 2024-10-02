// background.js

// Aguardar pelo clique no ícone da extensão ou mensagens de outros scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startElementSelection') {
    // Injeta o content script na aba ativa se não estiver injetado
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['content.js']
    }, () => {
      // Confirma o início do rastreamento
      chrome.tabs.sendMessage(sender.tab.id, { action: 'startElementSelection' });
    });
  } else if (message.action === 'fillForms') {
    chrome.tabs.sendMessage(sender.tab.id, { action: 'fillForms' });
  }
});

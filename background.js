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
// No background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openOptionsPage') {
    console.log('Dados do seletor recebidos no background:', request.selectorData);
    chrome.runtime.openOptionsPage(() => {
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'fillSelectorField',
          selectorData: request.selectorData  // Certifique-se de passar todo o objeto selectorData
        });
      }, 500);
    });
  }
});
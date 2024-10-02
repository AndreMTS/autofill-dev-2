document.addEventListener('DOMContentLoaded', function() {
    const fillFormsButton = document.getElementById('fillFormsButton');
    const trackFieldButton = document.getElementById('trackFieldButton');
    const optionsButton = document.getElementById('optionsButton');
    const statusDiv = document.getElementById('status');

    // Botão para preencher o formulário
    fillFormsButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "fillForms" }, function(response) {
                if (chrome.runtime.lastError) {
                    statusDiv.textContent = 'Erro: ' + chrome.runtime.lastError.message;
                } else if (response && response.success) {
                    statusDiv.textContent = response.message;
                } else {
                    statusDiv.textContent = 'Erro desconhecido ao preencher o formulário.';
                }
            });
        });
    });

    // Botão para rastrear campo
    trackFieldButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startElementSelection" });
            statusDiv.textContent = 'Modo de rastreamento ativado. Clique em um elemento na página.';
        });
    });

    // Botão para abrir a página de configurações diretamente
    optionsButton.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    // Listener para receber as informações do elemento selecionado
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'elementSelected') {
            const { css, xpath, ariaLabel } = request.selectorInfo;
            statusDiv.textContent = `CSS Selector: ${css}\nXPath: ${xpath}\nARIA Label: ${ariaLabel}`;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const fillFormsButton = document.getElementById('fillFormsButton');
    const optionsButton = document.getElementById('optionsButton');
    const statusDiv = document.getElementById('status');

    fillFormsButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "fillForms"}, function(response) {
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

    optionsButton.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
});
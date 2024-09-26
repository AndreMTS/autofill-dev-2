function getElementBySelector(selector) {
  let element = null;

  try {
    switch (selector.type) {
      case 'css':
        element = document.querySelector(selector.value);
        break;
      case 'xpath':
        element = document.evaluate(selector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        break;
      case 'aria-label':
        element = document.querySelector(`[aria-label="${selector.value}"]`);
        break;
    }
  } catch (error) {
    console.error(`Erro ao buscar elemento: ${selector.type} - ${selector.value}`, error);
  }

  return element;
}

function generateRandomData(dataType) {
  switch (dataType) {
    case 'cpf':
      return generateRandomCPF();
    case 'cnpj':
      return generateRandomCNPJ();
    case 'email':
      return generateRandomEmail();
    case 'phone':
      return generateRandomPhone();
    case 'date':
      return generateRandomDate();
    default:
      return generateRandomText();
  }
}

function generateRandomCPF() {
  const n = Array(9).fill(0).map(() => Math.floor(Math.random() * 10));
  const d1 = n.reduce((acc, cur, i) => acc + cur * (10 - i), 0) % 11 % 10;
  const d2 = (n.reduce((acc, cur, i) => acc + cur * (11 - i), 0) + d1 * 2) % 11 % 10;
  return `${n.join('')}${d1}${d2}`;
}

function generateRandomCNPJ() {
  const n = Array(12).fill(0).map(() => Math.floor(Math.random() * 10));
  const d1 = n.reduce((acc, cur, i) => acc + cur * (i < 4 ? 5 - i : 13 - i), 0) % 11 % 10;
  const d2 = (n.reduce((acc, cur, i) => acc + cur * (i < 5 ? 6 - i : 14 - i), 0) + d1 * 2) % 11 % 10;
  return `${n.slice(0, 2).join('')}.${n.slice(2, 5).join('')}.${n.slice(5, 8).join('')}/0001-${d1}${d2}`;
}

function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const username = Array(8).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

function generateRandomPhone() {
  const areaCode = Math.floor(Math.random() * 90 + 10);
  const firstPart = Math.floor(Math.random() * 9000 + 1000);
  const secondPart = Math.floor(Math.random() * 9000 + 1000);
  return `(${areaCode}) ${firstPart}-${secondPart}`;
}

function generateRandomDate() {
  const start = new Date(1970, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function generateRandomText() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array(10).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fillForms') {
    chrome.storage.sync.get('customFields', function(data) {
      const customFields = data.customFields || [];
      let filledCount = 0;
      let errorCount = 0;

      customFields.forEach(field => {
        let element = null;
        for (let selector of field.selectors) {
          element = getElementBySelector(selector);
          if (element) break;
        }
        if (element) {
          let value;
          if (field.useRandomData) {
            value = generateRandomData(field.dataType);
          } else {
            value = field.value;
          }
          
          if (value !== undefined && value !== null) {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Campo preenchido: ${field.description} com valor: ${value}`);
            filledCount++;
          } else {
            console.warn(`Valor não definido para o campo: ${field.description}`);
            errorCount++;
          }
        } else {
          console.warn(`Não foi possível encontrar o elemento para o campo: ${field.description}`);
          errorCount++;
        }
      });

      sendResponse({ 
        success: true, 
        message: `${filledCount} campo(s) preenchido(s) com sucesso. ${errorCount} erro(s) encontrado(s).` 
      });
    });
    return true;
  }
});
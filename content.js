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

function fillImageInput(element, imageData) {
  // Converter a string base64 em um Blob
  const byteString = atob(imageData.split(',')[1]);
  const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], {type: mimeString});
  
  // Criar um File a partir do Blob
  const file = new File([blob], 'image.jpg', { type: mimeString });
  
  // Criar um DataTransfer e adicionar o arquivo
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  
  // Definir os arquivos do elemento de input
  element.files = dataTransfer.files;
  
  // Disparar um evento de mudança
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fillForms') {
    chrome.storage.local.get(null, function(data) {
      const customFields = data.customFields || [];
      let filledCount = 0;
      let errorCount = 0;

      customFields.forEach(field => {
        let elements = getAllElementsBySelectors(field.selectors);
        
        if (elements.length > 0) {
          elements.forEach(element => {
            if (field.dataType === 'image') {
              chrome.storage.local.get(field.value, function(imageData) {
                if (imageData[field.value]) {
                  fillImageInput(element, imageData[field.value]);
                  filledCount++;
                } else {
                  console.warn(`Imagem não encontrada para o campo: ${field.description}`);
                  errorCount++;
                }
              });
            } else {
              let value;
              if (field.useRandomData) {
                value = generateRandomData(field.dataType);
              } else {
                value = field.value;
              }
              
              if (value !== undefined && value !== null) {
                setElementValue(element, value);
                console.log(`Campo preenchido: ${field.description} com valor: ${value}`);
                filledCount++;
              } else {
                console.warn(`Valor não definido para o campo: ${field.description}`);
                errorCount++;
              }
            }
          });
        } else {
          console.warn(`Não foi possível encontrar elementos para o campo: ${field.description}`);
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

function getAllElementsBySelectors(selectors) {
  let elements = [];
  for (let selector of selectors) {
    let foundElements = getElementsBySelector(selector);
    elements = elements.concat(foundElements);
  }
  return elements;
}

function getElementsBySelector(selector) {
  let elements = [];
  try {
    switch (selector.type) {
      case 'css':
        elements = Array.from(document.querySelectorAll(selector.value));
        break;
      case 'xpath':
        const xpathResult = document.evaluate(selector.value, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          elements.push(xpathResult.snapshotItem(i));
        }
        break;
      case 'aria-label':
        elements = Array.from(document.querySelectorAll(`[aria-label="${selector.value}"]`));
        break;
    }
  } catch (error) {
    console.error(`Erro ao buscar elementos: ${selector.type} - ${selector.value}`, error);
  }
  return elements;
}

function setElementValue(element, value) {
  if (element.tagName === 'SELECT') {
    const option = Array.from(element.options).find(opt => opt.value === value || opt.text === value);
    if (option) {
      element.value = option.value;
    } else {
      console.warn('Opção não encontrada para o select:', value);
    }
  } else if (element.tagName === 'INPUT' && element.type === 'checkbox') {
    element.checked = value === 'true' || value === true;
  } else if (element.tagName === 'INPUT' && element.type === 'radio') {
    const radioGroup = document.querySelectorAll(`input[name="${element.name}"]`);
    const radioToCheck = Array.from(radioGroup).find(radio => radio.value === value);
    if (radioToCheck) {
      radioToCheck.checked = true;
    }
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

// ... (mantenha as outras funções como estão)
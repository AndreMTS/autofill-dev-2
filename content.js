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

async function generateRandomData(dataType) {
  switch (dataType) {
    case 'cpf':
      return generateRandomCPF();
    case 'cep':
      return await buscarCepAleatorio();
    case 'cnpj':
      return generateRandomCNPJ();
    case 'email':
      return generateRandomEmail();
    case 'phone':
      return generateRandomPhone();
    case 'date':
      return generateRandomDate();
    case 'combobox':
      return generateRandomComboboxValue(); // Ou uma lógica específica para gerar valores de combobox
    default:
      return generateRandomText();
  }
}

function generateRandomComboboxValue() {
  const options = ['Indicação', 'Site / Landing page', 'Redes sociais'];
  return options[Math.floor(Math.random() * options.length)];
}

async function buscarCepAleatorio() {
  try {
    const response = await fetch('https://api.qualcep.com.br/zipcode/random?');
    if (!response.ok) {
      throw new Error('Falha ao buscar CEP aleatório');
    }
    const data = await response.json();
    if (data.id) {
      return data.id;
    } else {
      throw new Error('ID não encontrado na resposta da API');
    }    
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return 1310200;
  }
}


function generateRandomCPF() {
  const n = Array(9).fill(0).map(() => Math.floor(Math.random() * 10));
  const d1 = n.map((num, i) => num * (10 - i)).reduce((acc, curr) => acc + curr, 0);
  const modD1 = 11 - (d1 % 11);
  const firstCheckDigit = modD1 >= 10 ? 0 : modD1;
  const d2 = n.map((num, i) => num * (11 - i)).reduce((acc, curr) => acc + curr, 0) + firstCheckDigit * 2;
  const modD2 = 11 - (d2 % 11);
  const secondCheckDigit = modD2 >= 10 ? 0 : modD2;
  return `${n.join('')}${firstCheckDigit}${secondCheckDigit}`;
}

function generateRandomCNPJ() {
  const n = Array(12).fill(0).map(() => Math.floor(Math.random() * 10));
  const d1 = n.reduce((acc, cur, i) => acc + cur * (i < 4 ? 5 - i : 13 - i), 0) % 11 % 10;
  const d2 = (n.reduce((acc, cur, i) => acc + cur * (i < 5 ? 6 - i : 14 - i), 0) + d1 * 2) % 11 % 10;
  return `${n.slice(0, 2).join('')}.${n.slice(2, 5).join('')}.${n.slice(5, 8).join('')}/0001-${d1}${d2}`;
}

function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const domains = ['gmail1.com', 'yahoo2.com', 'hotmail3.com', 'outlook4.com'];
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
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const day = String(randomDate.getDate()).padStart(2, '0');
  const month = String(randomDate.getMonth() + 1).padStart(2, '0');
  const year = randomDate.getFullYear();
  return `${day}/${month}/${year}`;
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

      customFields.forEach(async field => { // Adicionar 'async' aqui para permitir o uso de 'await'
        let elements = getAllElementsBySelectors(field.selectors);
      
        if (elements.length > 0) {
          for (let element of elements) {
            try {
              if (field.dataType === 'image') {
                chrome.storage.local.get(field.value, function(imageData) {
                  if (imageData[field.value]) {
                    fillImageInput(element, imageData[field.value]);
                    filledCount++;
                  } else {
                    // console.warn(`Imagem não encontrada para o campo: ${field.description}`);
                    console.log(`Imagem não encontrada para o campo: ${field.description}`);
                    errorCount++;
                  }
                });
              } else {
                let value;
                if (field.useRandomData) {
                  // Usar 'await' para esperar a resolução de 'generateRandomData'
                  value = await generateRandomData(field.dataType);
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
            } catch (error) {
              console.error(`Erro ao preencher o campo ${field.description}:`, error);
              errorCount++;
            }
          }
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
  } else if (element.tagName === 'INPUT' && (element.getAttribute('role') === 'combobox' || element.type === 'search')) {
    simulateComboboxSelection(element, value);
  } else {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function simulateComboboxSelection(element, value) {
  // Focar no elemento
  element.focus();
  element.click();
  
  // Simular a digitação do valor
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Simular a abertura do combobox (pressionar seta para baixo)
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  
  // Esperar um pouco para o combobox abrir
  setTimeout(() => {
    // Encontrar a opção correspondente
    const options = Array.from(document.querySelectorAll(`[aria-owns="${element.getAttribute('aria-controls')}"] [role="option"]`));
    const selectedOption = options.find(option => option.textContent.trim().toLowerCase() === value.toLowerCase());
    
    if (selectedOption) {
      // Simular a seleção da opção encontrada
      selectedOption.click();
      selectedOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      selectedOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      
      // Atualizar o valor do input
      element.value = selectedOption.textContent.trim();
      
      // Disparar eventos de mudança
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // console.warn(`Opção "${value}" não encontrada no combobox.`);
      console.log(`Opção "${value}" não encontrada no combobox.`);
    }
    
    // Simular o fechamento do combobox
    document.body.click();
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }, 100);
}

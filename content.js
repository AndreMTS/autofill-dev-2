
async function generateRandomData(dataType) {
  switch (dataType) {
    case 'cpf':
      return generateRandomCPF();
    case 'cep':
      return await buscarCepAleatorio();
    case 'nomesPessoa':
      return generateNomesPessoa();
    case 'nomesEmpresa':
      return generateNomesEmpresa();
    case 'cnpj':
      return generateRandomCNPJ();
    case 'email':
      return generateRandomEmail();
    case 'phone':
      return generateRandomPhone();
    case 'referencia':
      return generateRandomReferencia();
    case 'date':
      return generateRandomDate();
    case 'combobox':
      return generateRandomComboboxValue();
    default:
      return generateRandomText();
  }
}


function generateRandomReferencia() {
  const referencia = ['Casa', 'Apartamento', 'Condomínio', 'Loja', 'Escritório', 'Galpão', 'Sala', 'Terreno', 'Chácara', 'Fazenda'];
  const numeroAleatorio = Math.floor(Math.random() * 1000) + 1;
  return `${referencia[Math.floor(Math.random() * referencia.length)]} ${numeroAleatorio}`;
}

function generateNomesEmpresa() {
  const nomes = ['Alfa Tech', 'Beta Soluções', 'Gamma Consultoria', 'Delta Serviços', 'Omega Engenharia', 'Sigma Sistemas', 'Zeta Logística', 'Teta Design', 'Kappa Finanças', 'Lambda Educação'];
  const sufixos = ['LTDA', 'ME', 'EIRELI', 'SOCIEDADE', 'ASSOCIACAO', 'FUNDACAO', 'INSTITUTO', 'COOPERATIVA'];
  const numeroAleatorio = Math.floor(Math.random() * 1000) + 1;
  return `${nomes[Math.floor(Math.random() * nomes.length)]} ${sufixos[Math.floor(Math.random() * sufixos.length)]} ${numeroAleatorio}`;
}

function generateNomesPessoa() {
  const nomes = ['João', 'Maria', 'José', 'Ana', 'Pedro', 'Carla', 'Marcelo', 'Juliana', 'André', 'Beatriz', 'Carlos', 'Daniela', 'Eduardo', 'Fabiana', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Kauã', 'Larissa', 'Matheus', 'Marisa', 'Nathalia', 'Otávio', 'Patrícia', 'Rafael', 'Samanta', 'Tiago', 'Vitória', 'Washington', 'Ximena', 'Yuri', 'Zara'];
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Pereira', 'Carvalho', 'Ribeiro', 'Almeida', 'Ferreira', 'Martins', 'Gomes', 'Souza', 'Costa', 'Nascimento', 'Gonçalves', 'Lima', 'Araújo', 'Mendes', 'Barbosa', 'Freitas', 'Moura', 'Pinto', 'Vieira', 'Carvalho', 'Ribeiro', 'Almeida', 'Ferreira', 'Martins', 'Gomes', 'Souza', 'Costa', 'Nascimento', 'Gonçalves', 'Lima', 'Araújo', 'Mendes', 'Barbosa', 'Freitas', 'Moura', 'Pinto', 'Vieira'];
  const numeroAleatorio = Math.floor(Math.random() * 1000) + 1;
  return `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]} ${numeroAleatorio}`;
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
    const cep = data[0]?.id;
    if (cep) {
      return cep;
    } else {
      console.error('ID não encontrado na resposta da API');
      return 1310200;
    }
  } catch (error) {
    console.error('Erro ao buscar CEP retonando padrão:', error);
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
  const generateRandomDigits = (length) => Array.from({ length }, () => Math.floor(Math.random() * 9));
  const mod = (dividendo, divisor) => dividendo % divisor;
  const [n1, n2, n3, n4, n5, n6, n7, n8] = generateRandomDigits(8);
  const n9 = 0, n10 = 0, n11 = 0, n12 = 1;
  const calcDigit = (weights, numbers) => {
    const sum = weights.reduce((acc, weight, i) => acc + weight * numbers[i], 0);
    const digit = 11 - mod(sum, 11);
    return digit >= 10 ? 0 : digit;
  };
  const d1 = calcDigit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12]);
  const d2 = calcDigit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, d1]);
  return `${n1}${n2}.${n3}${n4}${n5}.${n6}${n7}${n8}/0001-${d1}${d2}`;
}

function generateRandomEmail() {
  const domains = ['gmail1.com', 'yahoo2.com', 'hotmail3.com', 'outlook4.com'];
  const nomeCompleto = generateNomesPessoa().toLowerCase().replace(/\s+/g, '.');
  const numeroAleatorio = Math.floor(Math.random() * 1000) + 1;
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${nomeCompleto}${numeroAleatorio}@${domain}`;
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
  const blob = new Blob([ab], { type: mimeString });

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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'fillForms') {
    chrome.storage.local.get(null, function (data) {
      const customFields = data.customFields || [];
      let filledCount = 0;
      let errorCount = 0;

      customFields.forEach(async field => { // Adicionar 'async' aqui para permitir o uso de 'await'
        let elements = getAllElementsBySelectors(field.selectors);

        if (elements.length > 0) {
          for (let element of elements) {
            try {
              if (field.dataType === 'image') {
                chrome.storage.local.get(field.value, function (imageData) {
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
                  console.log(`Valor não definido para o campo: ${field.description}`);
                  errorCount++;
                }
              }
            } catch (error) {
              console.error(`Erro ao preencher o campo ${field.description}:`, error);
              errorCount++;
            }
          }
        } else {
          console.log(`Não foi possível encontrar elementos para o campo: ${field.description}`);
          errorCount++;
        }
      });

      sendResponse({
        success: true,
        // message: `${filledCount} campo(s) preenchido(s) com sucesso. ${errorCount} erro(s) encontrado(s).`
        message: `${filledCount} campo(s) preenchido(s) com sucesso.`
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
        // Usa o formato correto de XPath, como o que o Chrome gera
        const xpathResult = document.evaluate(selector.value, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          elements.push(xpathResult.snapshotItem(i));
        }
        break;
      case 'aria-label':
        elements = Array.from(document.querySelectorAll(`[aria-label="${selector.value}"]`));
        break;
      case 'placeholder':
        elements = Array.from(document.querySelectorAll(`[placeholder="${selector.value}"]`));
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
      console.log('Opção não encontrada para o select:', value);
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

function generateCSSSelector(element) {
  let path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += '#' + element.id;
      path.unshift(selector);
      break;
    } else {
      let sibling = element;
      let nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() == selector)
          nth++;
      }
      if (nth != 1)
        selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
}

function generateXPath(element) {
  // Se o elemento tem um id, use o formato XPath adequado para id
  if (element.id !== '') {
    // Remover espaços em branco do id para garantir um XPath válido
    const cleanedId = element.id.trim(); // remove espaços em branco antes e depois
    return `//*[@id="${cleanedId}"]`;
  }

  // Se o elemento for o body, retorne apenas o nome da tag
  if (element === document.body) {
    return element.tagName.toLowerCase();
  }

  // Conta a posição do elemento em relação aos seus irmãos
  let ix = 0;
  let siblings = element.parentNode.childNodes;

  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i];

    // Se o elemento é encontrado entre os irmãos, construa o XPath recursivamente
    if (sibling === element) {
      // Gera o XPath do pai e concatena o elemento atual com sua posição
      return generateXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
    }

    // Conta quantos irmãos de mesmo tipo o elemento possui
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++;
    }
  }
}



// Adicione um painel flutuante
const panel = document.createElement('div');
panel.style.position = 'fixed';
panel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

panel.style.borderRadius = '10px';
panel.style.top = '10px';
panel.style.right = '10px';
panel.style.backgroundColor = 'white';

panel.style.padding = '10px';
panel.style.zIndex = '9999';
panel.style.display = 'none'; // Inicialmente escondido

document.body.appendChild(panel);

let isSelecting = false;
let highlightedElement = null;

function startElementSelection() {
  isSelecting = true;
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mouseover', highlightElement);
  document.addEventListener('click', selectElement);
}

function stopElementSelection() {
  isSelecting = false;
  document.body.style.cursor = 'default';
  document.removeEventListener('mouseover', highlightElement);
  document.removeEventListener('click', selectElement);
  if (highlightedElement) {
    highlightedElement.style.outline = '';
    highlightedElement = null;
  }
}

function highlightElement(e) {
  if (highlightedElement) {
    highlightedElement.style.outline = '';
  }
  highlightedElement = e.target;
  highlightedElement.style.outline = '2px solid red';
}

function selectElement(e) {
  e.preventDefault();
  e.stopPropagation();

  if (isSelecting) {
    const element = e.target;

    // Gera os seletores
    const selectorInfo = {
      css: generateCSSSelector(element),
      xpath: generateXPath(element),
      ariaLabel: element.getAttribute('aria-label'),
      placeholder: element.getAttribute('placeholder')
    };

    // Log para verificar os valores gerados
    console.log("Selectors gerados:", selectorInfo);

    // Escapa as aspas no XPath para evitar problemas na atribuição ao data-selector
    const escapedXPath = selectorInfo.xpath.replace(/"/g, '&quot;');

    // Atualiza o conteúdo do painel
    panel.innerHTML = `
      <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 15px; font-weight: 900;">CSS Selector: </span>
              <span style="margin-left: 10px; font-size: 15px; color: #2c3e50;">${selectorInfo.css}</span>
              <button style="border: 0px;margin-left: 10px; border-radius: 5px; padding: 0px 15px; color: white; background: #3498db; border-color: #3498db;" class="copy-button" data-selector="${selectorInfo.css}" data-type="css">Copiar</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 15px; font-weight: 900;">XPath: </span>
              <span style="margin-left: 10px; font-size: 15px; color: #2c3e50;">${selectorInfo.xpath}</span>
              <button style="border: 0px;margin-left: 10px; border-radius: 5px; padding: 0px 15px; color: white; background: #3498db; border-color: #3498db;" class="copy-button" data-selector="${escapedXPath}" data-type="xpath">Copiar</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 15px; font-weight: 900;">ARIA Label: </span>
              <span style="margin-left: 10px; font-size: 15px; color: #2c3e50;">${selectorInfo.ariaLabel || 'N/A'}</span>
              <button style="border: 0px;margin-left: 10px; border-radius: 5px; padding: 0px 15px; color: white; background: #3498db; border-color: #3498db;" class="copy-button" data-selector="${selectorInfo.ariaLabel || ''}" data-type="ariaLabel">Copiar</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 15px; font-weight: 900;">Placeholder: </span>
              <span style="margin-left: 10px; font-size: 15px; color: #2c3e50;">${selectorInfo.placeholder || 'N/A'}</span>
              <button style="border: 0px;margin-left: 10px; border-radius: 5px; padding: 0px 15px; color: white; background: #3498db; border-color: #3498db;" class="copy-button" data-selector="${selectorInfo.placeholder || ''}" data-type="placeholder">Copiar</button>
          </div>
      </div>`;

    panel.style.display = 'block'; // Mostra o painel

    stopElementSelection();

    // Adiciona o listener para os botões de copiar
    const copyButtons = panel.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const text = button.dataset.selector.trim(); // Valor correto armazenado
        const type = button.dataset.type;

        console.log(`Seletor copiado: ${text} (Tipo: ${type})`);

        copyToClipboard(text, type);
      });
    });
  }
}


// No content.js (onde o seletor é copiado)
function copyToClipboard(text, selectorType) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Texto copiado: ', text);
    console.log('Tipo do seletor: ', selectorType);

    chrome.runtime.sendMessage({
      action: 'openOptionsPage',
      selectorData: {
        type: selectorType,
        value: text
      }
    });
  }, (err) => {
    console.error('Erro ao copiar: ', err);
  });

  // Para a seleção e esconde o painel
  stopElementSelection();
  panel.style.display = 'none';
}

// As funções generateCSSSelector e generateXPath permanecem inalteradas

// Adicione este listener ao final do arquivo
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startElementSelection') {
    startElementSelection();
  } else if (request.action === 'stopElementSelection') {
    stopElementSelection();
  }
});

// Impede a ativação do modo de seleção ao clicar no painel
panel.addEventListener('click', (e) => {
  e.stopPropagation();
});

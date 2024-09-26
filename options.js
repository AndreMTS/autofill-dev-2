let selectorCount = 0;

function addSelectorField() {
    const selectorList = document.getElementById('selectorList');
    const selectorItem = document.createElement('div');
    selectorItem.className = 'selectorItem';
    selectorItem.innerHTML = `
        <select class="selectorType">
            <option value="css">CSS</option>
            <option value="xpath">XPath</option>
            <option value="aria-label">Aria Label</option>
        </select>
        <input type="text" class="selector" placeholder="Seletor" required>
        <button type="button" class="removeSelector">Remover</button>
    `;
    selectorList.appendChild(selectorItem);

    selectorItem.querySelector('.removeSelector').addEventListener('click', function() {
        selectorList.removeChild(selectorItem);
    });

    selectorCount++;
}

document.getElementById('addSelector').addEventListener('click', addSelectorField);

function saveCustomField(description, value, selectors, useRandomData, dataType) {
    chrome.storage.sync.get('customFields', function(data) {
        let customFields = data.customFields || [];
        customFields.push({ description, value, selectors, useRandomData, dataType });
        chrome.storage.sync.set({ customFields }, function() {
            updateCustomFieldsList();
        });
    });
}

function updateCustomFieldsList(searchTerm = '') {
    chrome.storage.sync.get('customFields', function(data) {
        const customFields = data.customFields || [];
        const list = document.getElementById('customFieldsList');
        list.innerHTML = '';

        const filteredFields = customFields.filter(field => 
            field.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            field.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
            field.selectors.some(selector => 
                selector.value.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        filteredFields.forEach((field, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="field-content">
                    <div class="field-item">
                        <span class="field-label">Descrição:</span>
                        <span class="field-value" contenteditable="false">${highlightText(field.description, searchTerm)}</span>
                    </div>
                    <div class="field-item">
                        <span class="field-label">Valor:</span>
                        <span class="field-value" contenteditable="false">
                            ${field.useRandomData 
                                ? `<strong>Dados Aleatórios (${field.dataType})</strong>` 
                                : highlightText(field.value, searchTerm)}
                        </span>
                    </div>
                    <div class="selector-list">
                        ${field.selectors.map((selector, sIndex) => `
                            <div class="field-item">
                                <span class="field-label">${selector.type}:</span>
                                <span class="field-value" contenteditable="false">${highlightText(selector.value, searchTerm)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="button-group">
                        <button class="editButton">Editar</button>
                        <button class="saveButton" style="display:none;">Salvar</button>
                        <button class="cancelButton" style="display:none;">Cancelar</button>
                        <button class="deleteButton">Excluir</button>
                    </div>
                </div>
            `;

            const editButton = li.querySelector('.editButton');
            const saveButton = li.querySelector('.saveButton');
            const cancelButton = li.querySelector('.cancelButton');
            const deleteButton = li.querySelector('.deleteButton');
            const fieldValues = li.querySelectorAll('.field-value');

            editButton.addEventListener('click', () => {
                fieldValues.forEach(el => el.contentEditable = true);
                editButton.style.display = 'none';
                saveButton.style.display = 'inline-block';
                cancelButton.style.display = 'inline-block';
            });

            saveButton.addEventListener('click', () => {
                const updatedField = {
                    description: fieldValues[0].textContent,
                    value: fieldValues[1].textContent,
                    selectors: field.selectors.map((selector, sIndex) => ({
                        type: selector.type,
                        value: fieldValues[sIndex + 2].textContent
                    }))
                };
                customFields[index] = updatedField;
                chrome.storage.sync.set({ customFields }, () => {
                    updateCustomFieldsList();
                });
            });

            cancelButton.addEventListener('click', () => {
                updateCustomFieldsList();
            });

            deleteButton.addEventListener('click', () => deleteCustomField(index));

            list.appendChild(li);
        });
    });
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

document.addEventListener('DOMContentLoaded', function() {
    updateCustomFieldsList();
    addSelectorField(); // Adiciona um campo de seletor inicial

    const searchField = document.getElementById('searchField');
    searchField.addEventListener('input', function() {
        updateCustomFieldsList(this.value);
    });

    const useRandomDataCheckbox = document.getElementById('useRandomData');
    const dataTypeSelect = document.getElementById('dataType');
    const valueInput = document.getElementById('value');

    useRandomDataCheckbox.addEventListener('change', function() {
        dataTypeSelect.style.display = this.checked ? 'block' : 'none';
        valueInput.style.display = this.checked ? 'none' : 'block';
        valueInput.required = !this.checked;
    });

    document.getElementById('customFieldForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const useRandomData = document.getElementById('useRandomData').checked;
        const dataType = document.getElementById('dataType').value;
        const value = document.getElementById('value').value;
        const selectors = Array.from(document.querySelectorAll('.selectorItem')).map(item => ({
            type: item.querySelector('.selectorType').value,
            value: item.querySelector('.selector').value
        }));
        
        if (description && selectors.length > 0 && (useRandomData || value)) {
            saveCustomField(description, value, selectors, useRandomData, dataType);
            this.reset();
            document.getElementById('selectorList').innerHTML = '';
            addSelectorField();
            useRandomDataCheckbox.checked = false;
            dataTypeSelect.style.display = 'none';
            valueInput.style.display = 'block';
            valueInput.required = true;
        } else {
            alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um seletor.');
        }
    });
});

function deleteCustomField(index) {
    chrome.storage.sync.get('customFields', function(data) {
        let customFields = data.customFields || [];
        customFields.splice(index, 1);
        chrome.storage.sync.set({ customFields }, function() {
            updateCustomFieldsList();
        });
    });
}

// ... função deleteCustomField permanece a mesma
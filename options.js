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
        <button type="button" class="removeSelector"><i class="fa fa-trash" aria-hidden="true" title="Remover"></i></button>
    `;
    selectorList.appendChild(selectorItem);

    selectorItem.querySelector('.removeSelector').addEventListener('click', function() {
        selectorList.removeChild(selectorItem);
    });

    selectorCount++;
}

document.getElementById('addSelector').addEventListener('click', addSelectorField);

function saveCustomField(description, value, selectors, useRandomData, dataType) {
    chrome.storage.local.get('customFields', function(data) {
        let customFields = data.customFields || [];
        const newField = { description, value, selectors, useRandomData, dataType };
        
        if (dataType === 'image') {
            // Gerar um ID único para a imagem
            const imageId = 'img_' + Date.now();
            // Armazenar a imagem separadamente
            chrome.storage.local.set({ [imageId]: value }, function() {
                if (chrome.runtime.lastError) {
                    console.error('Erro ao salvar imagem:', chrome.runtime.lastError);
                    return;
                }
                // Armazenar apenas o ID da imagem no campo personalizado
                newField.value = imageId;
                customFields.push(newField);
                chrome.storage.local.set({ customFields }, function() {
                    updateCustomFieldsList();
                });
            });
        } else if (dataType === 'combobox') {
            newField.dataType = 'combobox';
        }
        
        customFields.push(newField);
        chrome.storage.local.set({ customFields }, function() {
            updateCustomFieldsList();
        });
    });
}

function updateCustomFieldsList(searchTerm = '') {
    chrome.storage.local.get('customFields', function(data) {
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
                chrome.storage.local.set({ customFields }, () => {
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
        valueInput.required = !this.checked && !isImageFieldCheckbox.checked;
        dataTypeSelect.style.display = this.checked ? 'block' : 'none';
        valueInput.style.display = this.checked ? 'none' : 'block';
    });

    const isImageFieldCheckbox = document.getElementById('isImageField');
    const imageUploadContainer = document.getElementById('imageUploadContainer');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');

    isImageFieldCheckbox.addEventListener('change', function() {
        if (this.checked) {
            valueInput.style.display = 'none';
            valueInput.required = false;
            imageUploadContainer.style.display = 'block';
            imageUpload.required = true;
            useRandomDataCheckbox.checked = false;
            useRandomDataCheckbox.disabled = true;
            dataTypeSelect.style.display = 'none';
        } else {
            valueInput.style.display = 'block';
            valueInput.required = !useRandomDataCheckbox.checked;
            imageUploadContainer.style.display = 'none';
            imageUpload.required = false;
            useRandomDataCheckbox.disabled = false;
        }
    });

    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('customFieldForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const isImageField = isImageFieldCheckbox.checked;
        const useRandomData = useRandomDataCheckbox.checked;
        const dataType = dataTypeSelect.value;
        let value = valueInput.value;
        const selectors = Array.from(document.querySelectorAll('.selectorItem')).map(item => ({
            type: item.querySelector('.selectorType').value,
            value: item.querySelector('.selector').value
        }));
        
        if (isImageField) {
            const file = imageUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    value = e.target.result;
                    saveCustomField(description, value, selectors, false, 'image');
                };
                reader.readAsDataURL(file);
            } else {
                alert('Por favor, selecione uma imagem.');
                return;
            }
        } else if (useRandomData) {
            saveCustomField(description, '', selectors, true, dataType);
        } else if (value) {
            saveCustomField(description, value, selectors, false, 'text');
        } else {
            alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um seletor.');
            return;
        }

        this.reset();
        document.getElementById('selectorList').innerHTML = '';
        addSelectorField();
        useRandomDataCheckbox.checked = false;
        dataTypeSelect.style.display = 'none';
        valueInput.style.display = 'block';
        valueInput.required = true;
        imageUploadContainer.style.display = 'none';
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        isImageFieldCheckbox.checked = false;
    });

    document.getElementById('exportFields').addEventListener('click', exportFields);
    document.getElementById('importFields').addEventListener('change', importFields);
});

function deleteCustomField(index) {
    chrome.storage.local.get('customFields', function(data) {
        let customFields = data.customFields || [];
        customFields.splice(index, 1);
        chrome.storage.local.set({ customFields }, function() {
            updateCustomFieldsList();
        });
    });
}

function exportFields() {
    chrome.storage.local.get('customFields', function(data) {
        const customFields = data.customFields || [];
        const blob = new Blob([JSON.stringify(customFields, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'auto_fill_dev2_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    });
}

function importFields(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedFields = JSON.parse(e.target.result);
                chrome.storage.local.set({customFields: importedFields}, function() {
                    updateCustomFieldsList();
                    alert('Campos importados com sucesso!');
                });
            } catch (error) {
                alert('Erro ao importar campos. Verifique se o arquivo é válido.');
                console.error('Erro ao importar campos:', error);
            }
        };
        reader.readAsText(file);
    }
}
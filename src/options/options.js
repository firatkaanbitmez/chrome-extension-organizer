document.addEventListener('DOMContentLoaded', function() {
    const categoriesContainer = document.getElementById('categories-container');
    let debounceTimeout;

    function loadCategories() {
        chrome.storage.local.get('categories', function(data) {
            categoriesContainer.innerHTML = '';
            Object.keys(data.categories || {}).forEach(categoryName => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category-edit';

                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.innerHTML = `
                    <input type="text" class="input-field" value="${categoryName}" ${categoryName === "Uncategorized" ? 'disabled' : ''}>
                    ${categoryName !== "Uncategorized" ? `<button class="delete-btn">Delete</button>` : ''}
                `;

                const extList = document.createElement('div');
                extList.className = 'dropzone';
                extList.dataset.category = categoryName;

                // Populate extensions within each category
                data.categories[categoryName].forEach(ext => {
                    const extDiv = createExtensionItem(ext);
                    extList.appendChild(extDiv);
                });

                categoryHeader.querySelector('.delete-btn')?.addEventListener('click', function() {
                    deleteCategory(categoryName);
                });

                const inputField = categoryHeader.querySelector('.input-field');
                inputField.addEventListener('input', function(e) {
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        updateCategoryName(categoryName, e.target.value);
                    }, 800); // Delay for 800ms before saving the new category name
                });

                categoryDiv.appendChild(categoryHeader);
                categoryDiv.appendChild(extList);
                categoriesContainer.appendChild(categoryDiv);
            });

            setupDragAndDrop();
        });
    }

    function createExtensionItem(ext) {
        const div = document.createElement('div');
        div.className = 'extension-item';
        div.setAttribute('draggable', 'true');
        div.dataset.id = ext.id;
        div.innerHTML = `
            <input type="checkbox" ${ext.enabled ? 'checked' : ''}>
            <span class="extension-label">${ext.name}</span>
        `;
        div.querySelector('input').addEventListener('change', function(e) {
            updateExtensionState(ext.id, e.target.checked);
        });
        return div;
    }

    function setupDragAndDrop() {
        const dropzones = document.querySelectorAll('.dropzone');

        dropzones.forEach(zone => {
            zone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('dragover');
            });

            zone.addEventListener('dragleave', function() {
                this.classList.remove('dragover');
            });

            zone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('dragover');
                const extensionId = e.dataTransfer.getData('text/plain');
                const extensionElement = document.querySelector(`[data-id="${extensionId}"]`);
                if (extensionElement) {
                    this.appendChild(extensionElement);
                    saveChanges(); // Automatically save changes after drag-and-drop
                }
            });
        });

        const extensionItems = document.querySelectorAll('.extension-item');
        extensionItems.forEach(item => {
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.dataset.id);
            });
        });
    }

    function updateCategoryName(oldName, newName) {
        if (oldName === "Uncategorized") return;

        chrome.storage.local.get('categories', function(data) {
            if (data.categories[newName] && newName !== oldName) {
                alert('This category name already exists. Please use a different name.');
                loadCategories();  // Reload categories to reset input fields
                return;
            }

            const extensions = data.categories[oldName];
            delete data.categories[oldName];  // Remove old category name
            data.categories[newName] = extensions;  // Assign extensions to new category name
            chrome.storage.local.set({categories: data.categories}, function() {
                loadCategories();  // Refresh the list of categories
            });
        });
    }

    function deleteCategory(categoryName) {
        chrome.storage.local.get('categories', function(data) {
            delete data.categories[categoryName];
            chrome.storage.local.set({ categories: data.categories }, loadCategories);
        });
    }

    function updateExtensionState(extensionId, isEnabled) {
        chrome.management.setEnabled(extensionId, isEnabled, function() {
            saveChanges(); // Automatically save after toggling an extension
        });
    }

    function saveChanges() {
        const updatedCategories = {};
        const categoryDivs = document.querySelectorAll('.category-edit');

        categoryDivs.forEach(categoryDiv => {
            const categoryName = categoryDiv.querySelector('.input-field').value;
            const extensions = [];

            const extensionItems = categoryDiv.querySelectorAll('.extension-item');
            extensionItems.forEach(item => {
                const extensionId = item.dataset.id;
                const extensionName = item.querySelector('.extension-label').textContent;
                const isEnabled = item.querySelector('input').checked;
                extensions.push({ id: extensionId, name: extensionName, enabled: isEnabled });
            });

            updatedCategories[categoryName] = extensions;
        });

        chrome.storage.local.set({ categories: updatedCategories }, function() {
            console.log('Changes saved automatically!');
        });
    }

    loadCategories();  // Initial load of categories
});

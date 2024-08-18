document.addEventListener('DOMContentLoaded', () => {
    const extensionsContainer = document.getElementById('extension-list');
    const categoriesContainer = document.getElementById('category-list');
    const addCategoryButton = document.getElementById('add-category-button');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const themeToggleButton = document.getElementById('theme-toggle-popup');

    // Initialize or update categories on start
    chrome.storage.local.get({ categories: {} }, (data) => {
        if (!data.categories["Uncategorized"]) {
            data.categories["Uncategorized"] = [];
        }
        chrome.management.getAll((extensions) => {
            extensions.forEach(ext => {
                // Assign to Uncategorized if not already categorized
                if (!Object.values(data.categories).some(c => c.some(e => e.id === ext.id))) {
                    data.categories["Uncategorized"].push({
                        id: ext.id,
                        name: ext.name,
                        enabled: ext.enabled
                    });
                }
            });
            chrome.storage.local.set({ categories: data.categories }, () => {
                loadExtensions();
                loadCategories();
            });
        });
    });

    function loadExtensions() {
        chrome.storage.local.get({ categories: {} }, (data) => {
            renderExtensions(data.categories["Uncategorized"]);
        });
    }

    function renderExtensions(extensions) {
        extensionsContainer.innerHTML = '';
        extensions.sort((a, b) => a.name.localeCompare(b.name)).forEach(ext => {
            const extDiv = createExtensionDiv(ext, "Uncategorized");
            extensionsContainer.appendChild(extDiv);
        });
    }

    function createExtensionDiv(ext, category) {
        const div = document.createElement('div');
        div.className = 'extension-item';
        div.setAttribute('draggable', 'true');
        div.dataset.id = ext.id;
        div.dataset.name = ext.name;
        div.innerHTML = `
            <input type="checkbox" id="chk-${ext.id}" ${ext.enabled ? 'checked' : ''}>
            <label for="chk-${ext.id}">${ext.name}</label>
        `;
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text', JSON.stringify({ id: ext.id, name: ext.name, enabled: ext.enabled, category: category }));
        });
        div.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            chrome.management.setEnabled(ext.id, e.target.checked);
        });
        return div;
    }

    function loadCategories() {
        chrome.storage.local.get({ categories: {} }, (data) => {
            categoriesContainer.innerHTML = '';
            Object.keys(data.categories).sort().forEach(category => {
                if (category !== 'Uncategorized') {
                    appendCategoryDiv(category, data.categories[category]);
                }
            });
        });
    }

    function appendCategoryDiv(category, extensions) {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-item';
        catDiv.dataset.name = category;
        catDiv.innerHTML = `<h3>${category}</h3><div class="extensions-in-category" data-category="${category}"></div><button class="delete-category">Delete</button>`;
        const extContainer = catDiv.querySelector('.extensions-in-category');
        extensions.forEach(ext => {
            const extDiv = createExtensionDiv(ext, category);
            extContainer.appendChild(extDiv);
        });
        catDiv.addEventListener('dragover', e => e.preventDefault());
        catDiv.addEventListener('drop', e => handleDrop(e, category));
        catDiv.querySelector('.delete-category').addEventListener('click', () => deleteCategory(category));
        categoriesContainer.appendChild(catDiv);
    }

    function handleDrop(event, categoryName) {
        event.preventDefault();
        const extensionData = JSON.parse(event.dataTransfer.getData('text'));
        moveExtensionToCategory(extensionData, categoryName);
    }

    function moveExtensionToCategory(extensionData, categoryName) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            // Remove the extension from all categories
            Object.keys(data.categories).forEach(cat => {
                data.categories[cat] = data.categories[cat].filter(ext => ext.id !== extensionData.id);
            });
            // Add the extension to the new category
            data.categories[categoryName].push(extensionData);
            chrome.storage.local.set({ categories: data.categories }, () => {
                loadCategories(); // Refresh all categories
                loadExtensions(); // Refresh the uncategorized list
            });
        });
    }

    function deleteCategory(name) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            if (data.categories[name]) {
                const extensionsToReassign = data.categories[name];
                delete data.categories[name];
                data.categories["Uncategorized"] = data.categories["Uncategorized"].concat(extensionsToReassign);
                chrome.storage.local.set({ categories: data.categories }, () => {
                    loadExtensions(); // Refresh the uncategorized list
                    loadCategories(); // Refresh all categories
                });
            }
        });
    }

    function addCategory() {
        const categoryName = newCategoryNameInput.value.trim();
        if (categoryName && !categoryName.includes("Uncategorized")) {
            chrome.storage.local.get({ categories: {} }, (data) => {
                if (!data.categories.hasOwnProperty(categoryName)) {
                    data.categories[categoryName] = [];
                    chrome.storage.local.set({ categories: data.categories }, loadCategories);
                    newCategoryNameInput.value = '';
                }
            });
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        chrome.storage.sync.set({ theme: document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode' });
    }

    themeToggleButton.addEventListener('click', toggleTheme);
    addCategoryButton.addEventListener('click', addCategory);
});

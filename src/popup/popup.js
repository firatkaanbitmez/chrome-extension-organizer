document.addEventListener('DOMContentLoaded', () => {
    const categoriesContainer = document.getElementById('category-list');
    const extensionsContainer = document.getElementById('extension-list');
    const themeToggleButton = document.getElementById('theme-toggle-popup');
    const addCategoryButton = document.getElementById('add-category');

    if (!categoriesContainer || !extensionsContainer || !themeToggleButton || !addCategoryButton) {
        console.error('One or more HTML elements are missing.');
        return;
    }

    function loadCategories() {
        chrome.storage.sync.get({ categories: [], extensions: [] }, (data) => {
            const categories = data.categories;
            const extensions = data.extensions;
    
            categoriesContainer.innerHTML = categories.map((category, index) =>
                `<div class="category-item" data-index="${index}">
                    <span>${category.name}</span>
                    <button class="delete-category" data-index="${index}">Delete</button>
                    <div class="category-extensions">
                        ${category.extensions.map(extId => {
                            const ext = extensions.find(e => e.id === extId);
                            return ext ? `<span>${ext.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>`
            ).join('');
    
            // Add delete functionality
            categoriesContainer.querySelectorAll('.delete-category').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.dataset.index;
                    chrome.storage.sync.get({ categories: [] }, (data) => {
                        const categories = data.categories;
                        categories.splice(index, 1);
                        chrome.storage.sync.set({ categories }, () => {
                            loadCategories();
                        });
                    });
                });
            });
    
            // Add dragover and drop event listeners
            categoriesContainer.querySelectorAll('.category-item').forEach(item => {
                item.addEventListener('dragover', (e) => e.preventDefault());
                item.addEventListener('drop', (e) => handleDrop(e, item.dataset.index));
            });
        });
    }
    
    
    function loadExtensions() {
        chrome.management.getAll((extensions) => {
            chrome.storage.sync.get({ categories: [] }, (data) => {
                const categories = data.categories;
                extensionsContainer.innerHTML = extensions.map(ext => 
                    `<div class="extension-item" draggable="true" data-id="${ext.id}">
                        <input type="checkbox" id="${ext.id}" ${ext.enabled ? 'checked' : ''}>
                        <label for="${ext.id}" class="extension-name">${ext.name}</label>
                    </div>`
                ).join('');

                // Add drag and drop functionality for extensions
                extensionsContainer.querySelectorAll('.extension-item').forEach(item => {
                    item.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', e.target.dataset.id);
                    });
                });

                // Handle extension checkbox change
                extensionsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        const id = e.target.id;
                        const enabled = e.target.checked;
                        chrome.management.setEnabled(id, enabled);
                    });
                });
            });
        });
    }

    function toggleTheme() {
        const currentMode = document.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
        const newMode = currentMode === 'light-mode' ? 'dark-mode' : 'light-mode';
        document.body.classList.remove(currentMode);
        document.body.classList.add(newMode);

        chrome.storage.sync.set({ theme: newMode });
    }

    function handleDrop(event, categoryIndex) {
        event.preventDefault();
        const extensionId = event.dataTransfer.getData('text/plain');
    
        chrome.storage.sync.get({ categories: [], extensions: [] }, (data) => {
            const categories = data.categories;
            const extensions = data.extensions;
            const extension = extensions.find(ext => ext.id === extensionId);
    
            if (extension) {
                if (!categories[categoryIndex].extensions.includes(extensionId)) {
                    categories[categoryIndex].extensions.push(extensionId);
                    chrome.storage.sync.set({ categories }, () => {
                        loadCategories(); // Load categories after update
                    });
                }
            }
        });
    }
    
    
    // Load initial data
    chrome.storage.sync.get({ theme: 'light-mode' }, (data) => {
        document.body.classList.add(data.theme);
    });

    loadCategories();
    loadExtensions();

    themeToggleButton.addEventListener('click', toggleTheme);
    addCategoryButton.addEventListener('click', () => {
        const categoryName = prompt('Enter category name:');
        if (categoryName) {
            chrome.storage.sync.get({ categories: [] }, (data) => {
                const categories = data.categories;
                categories.push({ name: categoryName, extensions: [] });
                chrome.storage.sync.set({ categories }, () => {
                    loadCategories();
                });
            });
        }
    });
});

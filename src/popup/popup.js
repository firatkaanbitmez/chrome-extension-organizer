document.addEventListener('DOMContentLoaded', () => {
    const extensionsContainer = document.getElementById('extension-list');
    const categoriesContainer = document.getElementById('category-list');
    const addCategoryButton = document.getElementById('add-category');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const themeToggleButton = document.getElementById('theme-toggle');

    // Initialize and Load the App
    init();

    function init() {
        // Load the theme preference from storage
        chrome.storage.sync.get(['theme'], (data) => {
            if (data.theme === 'dark-mode') {
                document.body.classList.add('dark-mode');
                themeToggleButton.checked = true;
            } else {
                document.body.classList.remove('dark-mode');
                themeToggleButton.checked = false;
            }
        });

        // Load categories and extensions from storage
        chrome.storage.local.get({ categories: {} }, (data) => {
            if (!data.categories["Uncategorized"]) {
                data.categories["Uncategorized"] = [];
            }
            chrome.management.getAll((extensions) => {
                extensions.forEach((ext) => {
                    if (!isExtensionCategorized(data.categories, ext.id)) {
                        data.categories["Uncategorized"].push({
                            id: ext.id,
                            name: ext.name,
                            enabled: ext.enabled
                        });
                    }
                });
                chrome.storage.local.set({ categories: data.categories }, () => {
                    loadCategories(data.categories);
                    loadExtensions(data.categories["Uncategorized"]);
                });
            });
        });

        // Event Listeners
        themeToggleButton.addEventListener('change', toggleTheme);
        addCategoryButton.addEventListener('click', addCategory);
    }

    // Check if an extension is already categorized
    function isExtensionCategorized(categories, extensionId) {
        return Object.values(categories).some((category) =>
            category.some((ext) => ext.id === extensionId)
        );
    }

    // Load extensions in the Uncategorized section
    function loadExtensions(extensions) {
        extensionsContainer.innerHTML = '';
        extensions.sort((a, b) => a.name.localeCompare(b.name)).forEach((ext) => {
            const extDiv = createExtensionDiv(ext, "Uncategorized");
            extensionsContainer.appendChild(extDiv);
        });
    }

    // Create the extension item div
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
            e.dataTransfer.setData('text', JSON.stringify({ id: ext.id, name: ext.name, enabled: ext.enabled, category }));
        });
        div.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            chrome.management.setEnabled(ext.id, e.target.checked);
        });
        return div;
    }

    // Load categories into the UI
    function loadCategories(categories) {
        categoriesContainer.innerHTML = '';
        Object.keys(categories).sort().forEach((category) => {
            if (category !== 'Uncategorized') {
                appendCategoryDiv(category, categories[category]);
            }
        });
    }

    // Append a category div to the UI
    function appendCategoryDiv(category, extensions) {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-item';
        catDiv.dataset.name = category;
        catDiv.innerHTML = `
            <h3>${category}</h3>
            <div class="extensions-in-category" data-category="${category}"></div>
            <button class="delete-category">X</button>
        `;
        const extContainer = catDiv.querySelector('.extensions-in-category');
        extensions.forEach((ext) => {
            const extDiv = createExtensionDiv(ext, category);
            extContainer.appendChild(extDiv);
        });
        catDiv.addEventListener('dragover', (e) => e.preventDefault());
        catDiv.addEventListener('drop', (e) => handleDrop(e, category));
        catDiv.querySelector('.delete-category').addEventListener('click', () => deleteCategory(category));
        categoriesContainer.appendChild(catDiv);
    }

    // Handle the drag-and-drop functionality
    function handleDrop(event, categoryName) {
        event.preventDefault();
        const extensionData = JSON.parse(event.dataTransfer.getData('text'));
        moveExtensionToCategory(extensionData, categoryName);
    }

    // Move an extension to a different category
    function moveExtensionToCategory(extensionData, categoryName) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            Object.keys(data.categories).forEach((cat) => {
                data.categories[cat] = data.categories[cat].filter((ext) => ext.id !== extensionData.id);
            });
            data.categories[categoryName].push(extensionData);
            chrome.storage.local.set({ categories: data.categories }, () => {
                loadCategories(data.categories);
                loadExtensions(data.categories["Uncategorized"]);
            });
        });
    }

    // Delete a category and reassign its extensions
    function deleteCategory(categoryName) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            if (data.categories[categoryName]) {
                const extensionsToReassign = data.categories[categoryName];
                delete data.categories[categoryName];
                data.categories["Uncategorized"] = data.categories["Uncategorized"].concat(extensionsToReassign);
                chrome.storage.local.set({ categories: data.categories }, () => {
                    loadExtensions(data.categories["Uncategorized"]);
                    loadCategories(data.categories);
                });
            }
        });
    }

    // Add a new category
    function addCategory() {
        const categoryName = newCategoryNameInput.value.trim();
        if (categoryName && !categoryName.includes("Uncategorized")) {
            chrome.storage.local.get({ categories: {} }, (data) => {
                if (!data.categories.hasOwnProperty(categoryName)) {
                    data.categories[categoryName] = [];
                    chrome.storage.local.set({ categories: data.categories }, () => {
                        loadCategories(data.categories);
                        newCategoryNameInput.value = '';
                    });
                }
            });
        }
    }

    // Toggle between dark mode and light mode
    function toggleTheme() {
        const isDarkMode = themeToggleButton.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        const theme = isDarkMode ? 'dark-mode' : 'light-mode';
        chrome.storage.sync.set({ theme });
    }
});

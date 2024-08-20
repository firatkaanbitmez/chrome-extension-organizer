document.addEventListener('DOMContentLoaded', () => {
    const extensionsContainer = document.getElementById('extension-list');
    const categoriesContainer = document.getElementById('category-list');
    const addCategoryButton = document.getElementById('add-category');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const themeToggleButton = document.getElementById('theme-toggle');
    const optionsButton = document.getElementById('options-button');

    init();

    function init() {
        // Load the theme preference from storage
        chrome.storage.sync.get(['theme'], (data) => {
            document.body.classList.toggle('dark-mode', data.theme === 'dark-mode');
            themeToggleButton.checked = data.theme === 'dark-mode';
        });

        // Load categories and extensions from storage
        loadExtensionsData();

        // Event Listeners
        themeToggleButton.addEventListener('change', toggleTheme);
        addCategoryButton.addEventListener('click', addCategory);
        optionsButton.addEventListener('click', openOptionsPage);

        // Listener for when an extension is uninstalled
        chrome.management.onUninstalled.addListener(handleExtensionUninstalled);
    }

    categoriesContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-category')) {
            const categoryName = event.target.dataset.categoryName;
            deleteCategory(categoryName);
        }
    });

    function openOptionsPage() {
        chrome.runtime.openOptionsPage();
    }

    function loadExtensionsData() {
        chrome.storage.local.get({ categories: {} }, (data) => {
            if (!data.categories["Uncategorized"]) {
                data.categories["Uncategorized"] = [];
            }
            chrome.management.getAll((extensions) => {
                // Remove deleted extensions from categories
                Object.keys(data.categories).forEach(category => {
                    data.categories[category] = data.categories[category].filter(ext =>
                        extensions.some(e => e.id === ext.id)
                    );
                });

                // Add remaining extensions to the appropriate categories
                extensions.forEach((ext) => {
                    const foundCategory = Object.keys(data.categories).find(category =>
                        data.categories[category].some(e => e.id === ext.id)
                    );
                    if (!foundCategory) {
                        data.categories["Uncategorized"].push({
                            id: ext.id,
                            name: ext.name,
                            enabled: ext.enabled,
                            icons: ext.icons
                        });
                    } else {
                        const index = data.categories[foundCategory].findIndex(e => e.id === ext.id);
                        data.categories[foundCategory][index].enabled = ext.enabled;
                        data.categories[foundCategory][index].icons = ext.icons;
                    }
                });

                // Save the updated categories back to storage
                chrome.storage.local.set({ categories: data.categories }, () => {
                    loadCategories(data.categories);
                });
            });
        });
    }

    function createExtensionDiv(ext) {
        const div = document.createElement('div');
        div.className = 'extension-item';
        div.setAttribute('draggable', 'true');
        div.dataset.id = ext.id;
        const iconURL = ext.icons ? ext.icons[ext.icons.length - 1].url : 'default_icon.png';
        div.innerHTML = `
            <input type="checkbox" id="chk-${ext.id}" ${ext.enabled ? 'checked' : ''}>
            <img src="${iconURL}" alt="${ext.name}" class="extension-icon" />
            <label for="chk-${ext.id}">${ext.name}</label>
        `;
        div.querySelector('input[type="checkbox"]').addEventListener('change', e => {
            chrome.management.setEnabled(ext.id, e.target.checked, () => {
                loadExtensionsData();
            });
        });
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(ext));
        });
        return div;
    }

    function loadCategories(categories) {
        categoriesContainer.innerHTML = '';

        const sortedCategories = Object.keys(categories).filter(cat => cat !== "Uncategorized").sort();

        if (categories["Uncategorized"]) {
            sortedCategories.push("Uncategorized");
        }

        sortedCategories.forEach(category => {
            const catDiv = document.createElement('div');
            catDiv.className = 'category-item';
            catDiv.dataset.name = category;
            catDiv.innerHTML = `
                <h3>${category}</h3>
                ${category !== "Uncategorized" ? `<button class="delete-category" data-category-name="${category}">X</button>` : ""}
                <div class="extensions-in-category"></div>
            `;
            const extContainer = catDiv.querySelector('.extensions-in-category');
            categories[category].forEach(ext => {
                extContainer.appendChild(createExtensionDiv(ext));
            });
            catDiv.addEventListener('dragover', e => e.preventDefault());
            catDiv.addEventListener('drop', e => handleDrop(e, category));
            categoriesContainer.appendChild(catDiv);
        });
    }

    function handleDrop(event, categoryName) {
        event.preventDefault();
        const extensionData = JSON.parse(event.dataTransfer.getData('text/plain'));
        moveExtensionToCategory(extensionData, categoryName);
    }

    function moveExtensionToCategory(ext, categoryName) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            Object.keys(data.categories).forEach(cat => {
                data.categories[cat] = data.categories[cat].filter(e => e.id !== ext.id);
            });
            ext.category = categoryName;
            data.categories[categoryName].push(ext);
            chrome.storage.local.set({ categories: data.categories }, () => {
                loadCategories(data.categories);
            });
        });
    }

    function toggleTheme() {
        const isDarkMode = themeToggleButton.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        chrome.storage.sync.set({ theme: isDarkMode ? 'dark-mode' : 'light-mode' });
    }

    function deleteCategory(categoryName) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            delete data.categories[categoryName];
            chrome.storage.local.set({ categories: data.categories }, () => {
                loadCategories(data.categories);
            });
        });
    }

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

    function handleExtensionUninstalled(extensionId) {
        chrome.storage.local.get({ categories: {} }, (data) => {
            Object.keys(data.categories).forEach((category) => {
                data.categories[category] = data.categories[category].filter(
                    (ext) => ext.id !== extensionId
                );
            });
            chrome.storage.local.set({ categories: data.categories }, () => {
                loadCategories(data.categories);
            });
        });
    }
});

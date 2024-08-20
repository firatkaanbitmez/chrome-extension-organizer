import { Service } from './services.js';
import { Utility } from './utils.js';

export const UI = (() => {
    const elements = {
        extensionsContainer: document.getElementById('extension-list'),
        categoriesContainer: document.getElementById('category-list'),
        addCategoryButton: document.getElementById('add-category'),
        newCategoryNameInput: document.getElementById('new-category-name'),
        themeToggleButton: document.getElementById('theme-toggle'),
        optionsButton: document.getElementById('options-button')
    };

    let draggedExtension = null; // Sürüklenen uzantıyı saklamak için
    let draggedOverExtension = null; // Sürüklenilen öğenin üzerine gelinen uzantıyı saklamak için

    const init = () => {
        loadTheme();
        loadData();
        setupEventListeners();
    };

    const loadTheme = () => {
        Service.getThemePreference().then((theme) => {
            document.body.classList.toggle('dark-mode', theme === 'dark-mode');
            elements.themeToggleButton.checked = theme === 'dark-mode';
        });
    };

    const loadData = () => {
        Service.loadExtensionsData().then((categories) => {
            renderCategories(categories);
        });
    };

    const renderCategories = (categories) => {
        elements.categoriesContainer.innerHTML = '';
        const sortedCategories = Utility.sortCategories(categories);

        sortedCategories.forEach((category) => {
            elements.categoriesContainer.appendChild(createCategoryDiv(category, categories[category]));
        });
    };

    const setupEventListeners = () => {
        elements.themeToggleButton.addEventListener('change', toggleTheme);
        elements.addCategoryButton.addEventListener('click', addCategory);
        elements.optionsButton.addEventListener('click', Service.openOptionsPage);
    };

    const toggleTheme = () => {
        const isDarkMode = elements.themeToggleButton.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        Service.setThemePreference(isDarkMode ? 'dark-mode' : 'light-mode');
    };

    const createCategoryDiv = (categoryName, extensions) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-item';
        categoryDiv.dataset.name = categoryName;
        categoryDiv.innerHTML = `
            <h3>${categoryName}</h3>
            <button class="delete-category" data-category="${categoryName}">X</button>
            <div class="extensions-in-category"></div>
        `;
    
        const extContainer = categoryDiv.querySelector('.extensions-in-category');
        extensions.forEach((ext) => {
            extContainer.appendChild(createExtensionDiv(ext, categoryName));
        });
    
        // Silme butonu olay dinleyicisi
        const deleteButton = categoryDiv.querySelector('.delete-category');
        deleteButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
                Service.deleteCategory(categoryName).then(loadData);
            }
        });
    
        categoryDiv.addEventListener('dragover', (e) => e.preventDefault());
        categoryDiv.addEventListener('drop', (e) => handleDrop(e, categoryName));
    
        return categoryDiv;
    };
    

    const createExtensionDiv = (ext, categoryName) => {
        const extDiv = document.createElement('div');
        extDiv.className = 'extension-item';
        extDiv.dataset.id = ext.id;
        extDiv.draggable = true; // Sürüklenebilir yapıyoruz

        const iconURL = ext.icons && ext.icons.length > 0 ? ext.icons[ext.icons.length - 1].url : 'default_icon.png';
        extDiv.innerHTML = `
            <input type="checkbox" id="chk-${ext.id}" ${ext.enabled ? 'checked' : ''}>
            <img src="${iconURL}" alt="${ext.name}" class="extension-icon" />
            <label for="chk-${ext.id}">${ext.name}</label>
        `;

        const checkbox = extDiv.querySelector('input[type="checkbox"]');

        // Checkbox olay dinleyicisi
        checkbox.addEventListener('change', async (e) => {
            e.preventDefault();

            checkbox.disabled = true;

            const isEnabled = e.target.checked;

            try {
                await new Promise((resolve, reject) => {
                    chrome.management.setEnabled(ext.id, isEnabled, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                });

                checkbox.checked = isEnabled;

            } catch (error) {
                console.error(`Failed to update extension status: ${error.message}`);
                checkbox.checked = !isEnabled;
            } finally {
                checkbox.disabled = false;
            }
        });

        // Sürükleme olayları
        extDiv.addEventListener('dragstart', (e) => {
            draggedExtension = ext; // Sürüklenen öğeyi sakla
            e.dataTransfer.effectAllowed = 'move';
        });

        extDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            draggedOverExtension = ext; // Sürüklenen öğenin üzerine gelinen öğeyi sakla
        });

        extDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedExtension && draggedOverExtension && draggedExtension.id !== draggedOverExtension.id) {
                // Sıralamayı güncelle
                Service.reorderExtensionsInCategory(categoryName, draggedExtension, draggedOverExtension).then(loadData);
                draggedExtension = null;
                draggedOverExtension = null;
            }
        });

        return extDiv;
    };

    const handleDrop = (event, categoryName) => {
        event.preventDefault();

        if (draggedExtension) {
            Service.moveExtensionToCategory(draggedExtension, categoryName).then(loadData);
            draggedExtension = null; // Sürüklenen öğeyi temizle
        }
    };

    const addCategory = () => {
        const categoryName = elements.newCategoryNameInput.value.trim();
        if (categoryName && !categoryName.includes('Uncategorized')) {
            Service.addCategory(categoryName).then(loadData);
        }
    };

    return {
        init
    };
})();

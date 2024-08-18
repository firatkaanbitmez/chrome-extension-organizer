document.addEventListener('DOMContentLoaded', () => {
    const extensionsContainer = document.getElementById('extension-list');
    const themeToggleButton = document.getElementById('theme-toggle-popup');

    if (!extensionsContainer || !themeToggleButton) {
        console.error('One or more HTML elements are missing.');
        return;
    }

    function loadExtensions() {
        chrome.management.getAll((extensions) => {
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
    }

    function toggleTheme() {
        const currentMode = document.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
        const newMode = currentMode === 'light-mode' ? 'dark-mode' : 'light-mode';
        document.body.classList.remove(currentMode);
        document.body.classList.add(newMode);

        chrome.storage.sync.set({ theme: newMode });
    }

    // Load initial data
    chrome.storage.sync.get({ theme: 'light-mode' }, (data) => {
        document.body.classList.add(data.theme);
    });

    loadExtensions();

    themeToggleButton.addEventListener('click', toggleTheme);
});

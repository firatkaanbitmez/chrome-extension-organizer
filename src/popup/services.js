export const Service = (() => {
    const getThemePreference = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['theme'], (data) => {
                resolve(data.theme || 'light-mode');
            });
        });
    };

    const setThemePreference = (theme) => {
        chrome.storage.sync.set({ theme });
    };

    const loadExtensionsData = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get({ categories: {} }, (data) => {
                if (!data.categories['Uncategorized']) {
                    data.categories['Uncategorized'] = [];
                }

                chrome.management.getAll((extensions) => {
                    const existingExtensionIds = extensions.map((ext) => ext.id);

                    // Silinen uzantıları temizleyelim
                    Object.keys(data.categories).forEach((category) => {
                        data.categories[category] = data.categories[category].filter((ext) =>
                            existingExtensionIds.includes(ext.id)
                        );
                    });

                    // Mevcut uzantıları kategorilere ekleyelim veya güncelleyelim
                    extensions.forEach((ext) => {
                        const foundCategory = Object.keys(data.categories).find((category) =>
                            data.categories[category].some((e) => e.id === ext.id)
                        );

                        if (!foundCategory) {
                            data.categories['Uncategorized'].push(ext);
                        } else {
                            const index = data.categories[foundCategory].findIndex((e) => e.id === ext.id);
                            data.categories[foundCategory][index].enabled = ext.enabled;
                            data.categories[foundCategory][index].icons = ext.icons;
                        }
                    });

                    chrome.storage.local.set({ categories: data.categories }, () => {
                        resolve(data.categories); // Kategorileri geri döndürüyoruz
                    });
                });
            });
        });
    };

    const toggleExtension = (extensionId, enabled) => {
        return new Promise((resolve) => {
            chrome.management.setEnabled(extensionId, enabled, resolve);
        });
    };

    const moveExtensionToCategory = (ext, categoryName) => {
        return new Promise((resolve) => {
            chrome.storage.local.get({ categories: {} }, (data) => {
                Object.keys(data.categories).forEach((cat) => {
                    data.categories[cat] = data.categories[cat].filter((e) => e.id !== ext.id);
                });

                data.categories[categoryName].push(ext);
                chrome.storage.local.set({ categories: data.categories }, resolve);
            });
        });
    };

    const reorderExtensionsInCategory = (categoryName, draggedExtension, draggedOverExtension) => {
        return new Promise((resolve) => {
            chrome.storage.local.get({ categories: {} }, (data) => {
                const category = data.categories[categoryName];

                const draggedIndex = category.findIndex((e) => e.id === draggedExtension.id);
                const overIndex = category.findIndex((e) => e.id === draggedOverExtension.id);

                if (draggedIndex > -1 && overIndex > -1) {
                    category.splice(draggedIndex, 1);
                    category.splice(overIndex, 0, draggedExtension);
                    data.categories[categoryName] = category;
                }

                chrome.storage.local.set({ categories: data.categories }, resolve);
            });
        });
    };

    const addCategory = (categoryName) => {
        return new Promise((resolve) => {
            chrome.storage.local.get({ categories: {} }, (data) => {
                if (!data.categories[categoryName]) {
                    data.categories[categoryName] = [];
                    chrome.storage.local.set({ categories: data.categories }, resolve);
                } else {
                    resolve();
                }
            });
        });
    };

    const deleteCategory = (categoryName) => {
        return new Promise((resolve) => {
            chrome.storage.local.get({ categories: {} }, (data) => {
                delete data.categories[categoryName];
                chrome.storage.local.set({ categories: data.categories }, resolve);
            });
        });
    };

    const openOptionsPage = () => {
        chrome.runtime.openOptionsPage();
    };

    return {
        getThemePreference,
        setThemePreference,
        loadExtensionsData,
        toggleExtension,
        moveExtensionToCategory,
        reorderExtensionsInCategory,
        addCategory,
        deleteCategory,
        openOptionsPage
    };
})();

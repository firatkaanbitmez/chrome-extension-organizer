chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ categories: [] }, (data) => {
    if (!data.categories.length) {
      chrome.storage.sync.set({ categories: [] });
    }
  });
});

chrome.management.onEnabled.addListener((extension) => {
  console.log(`${extension.name} is enabled.`);
});

chrome.management.onDisabled.addListener((extension) => {
  console.log(`${extension.name} is disabled.`);
});



chrome.management.onEnabled.addListener((extension) => {
  console.log(`${extension.name} is enabled.`);
});

chrome.management.onDisabled.addListener((extension) => {
  console.log(`${extension.name} is disabled.`);
});

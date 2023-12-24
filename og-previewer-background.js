browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL has changed
  if (changeInfo.url) {
    // Send a message to the devtools panel to trigger a refresh
    browser.tabs.sendMessage(tabId, { action: "refresh" });
  }
});

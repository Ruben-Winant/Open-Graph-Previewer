browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL has changed
  if ("complete" === changeInfo.status) {
    // Send a message to the devtools panel to trigger a refresh
    browser.runtime.sendMessage({ tabId, action: "refresh" });
  }
});

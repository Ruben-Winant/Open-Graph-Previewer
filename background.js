browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ("complete" === changeInfo.status) {
    browser.runtime.sendMessage({ tabId, action: "refresh" });
    if (
      changeInfo.url &&
      (changeInfo.url.includes("youtu") || changeInfo.url.includes("twitch"))
    ) {
      browser.tabs.reload();
    }
  }
});

browser.runtime.onInstalled.addListener(function () {
  browser.storage.local.set({ enabled: false });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  browser.storage.local.get("enabled", function (result) {
    if (result.enabled && "complete" === changeInfo.status) {
      browser.runtime.sendMessage({ tabId, action: "turnedon" });
      browser.runtime.sendMessage({ tabId, action: "refresh" });
      if (
        changeInfo.url &&
        (changeInfo.url.includes("youtu") || changeInfo.url.includes("twitch"))
      ) {
        browser.tabs.reload();
      }
    } else {
      browser.runtime.sendMessage({ tabId, action: "turnedoff" });
    }
  });
});

console.log("bg-test");

browser.devtools.inspectedWindow.eval(
  `
    console.log('bg-test-2');
    `
);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  browser.devtools.inspectedWindow.eval(
    `
    console.log('changes detected');
    `
  );
  // Check if the URL has changed
  if (changeInfo.url) {
    // Send a message to the devtools panel to trigger a refresh
    browser.tabs.sendMessage(tabId, { action: "refresh" });
  }
});

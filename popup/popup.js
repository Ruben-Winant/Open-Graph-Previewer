document.addEventListener("DOMContentLoaded", function () {
  let toggleButton = document.getElementById("toggleButton");

  browser.storage.local.get("enabled", function (result) {
    toggleButton.textContent = result.enabled ? "Turn off" : "Turn on";
  });

  toggleButton.addEventListener("click", function () {
    browser.storage.local.get("enabled", function (result) {
      let enabled = !result.enabled;
      browser.storage.local.set({ enabled: enabled });
      toggleButton.textContent = result.enabled ? "Turn off" : "Turn on";

      browser.tabs.reload();
      window.close();
    });
  });
});

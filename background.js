// background.js

console.log("[BG] Service worker started");

chrome.runtime.onInstalled.addListener(() => {
  console.log("[BG] Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BG] Message received:", message);

  if (message.type === "ADD_TIME") {
    const { category, seconds, date } = message.payload;

    chrome.storage.local.get(["watchData"], (result) => {
      const data = result.watchData || {};

      if (!data[date]) {
        data[date] = {
          music: 0,
          entertainment: 0,
          knowledge: 0,
          other: 0,
        };
      }

      data[date][category] = (data[date][category] || 0) + seconds;

      chrome.storage.local.set({ watchData: data }, () => {
        console.log("[BG] Time saved");
        sendResponse({ success: true });
      });
    });

    return true; // VERY IMPORTANT
  }
});

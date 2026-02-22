chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ADD_TIME") {
    const { category, seconds, date } = message.payload;
    chrome.storage.local.get(["watchData"], (result) => {
      const data = result.watchData || {};
      if (!data[date])
        data[date] = { music: 0, entertainment: 0, knowledge: 0, other: 0 };
      data[date][category] = (data[date][category] || 0) + seconds;
      chrome.storage.local.set({ watchData: data }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Keep the message channel open for the async sendResponse
  }
});

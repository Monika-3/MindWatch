chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ADD_TIME") {
    const { category, seconds, date } = message.payload;
    chrome.storage.local
      .get(["watchData"])
      .then((result) => {
        const data = result.watchData || {};
        if (!data[date]) {
          data[date] = { music: 0, entertainment: 0, knowledge: 0, other: 0 };
        }
        data[date][category] = (data[date][category] || 0) + seconds;
        return chrome.storage.local.set({ watchData: data });
      })
      .then(() => {
        sendResponse({ ok: true });
      })
      .catch((err) => {
        console.error("[YT Tracker] Storage error:", err);
        sendResponse({ ok: false });
      });
    return true;
  }
});

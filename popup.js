function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function loadStats() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("today-date").textContent = today;

  chrome.storage.local.get(["watchData"], (result) => {
    const data = result.watchData || {};
    const todayData = data[today] || {
      music: 0,
      entertainment: 0,
      knowledge: 0,
      other: 0,
    };

    document.getElementById("music-time").textContent = formatTime(
      todayData.music || 0,
    );
    document.getElementById("entertainment-time").textContent = formatTime(
      todayData.entertainment || 0,
    );
    document.getElementById("knowledge-time").textContent = formatTime(
      todayData.knowledge || 0,
    );
    document.getElementById("other-time").textContent = formatTime(
      todayData.other || 0,
    );

    const total =
      (todayData.music || 0) +
      (todayData.entertainment || 0) +
      (todayData.knowledge || 0) +
      (todayData.other || 0);
    document.getElementById("total-time").textContent = formatTime(total);
  });
}

document.getElementById("clear-btn").addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  chrome.storage.local.get(["watchData"], (result) => {
    const data = result.watchData || {};
    data[today] = { music: 0, entertainment: 0, knowledge: 0, other: 0 };
    chrome.storage.local.set({ watchData: data }, loadStats);
  });
});

loadStats();

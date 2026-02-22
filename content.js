let trackingInterval = null;
let currentVideoId = null;

function detectCategory() {
  const title = document.title.toLowerCase();
  const channelEl = document.querySelector(
    "#channel-name a, #owner-name a, yt-formatted-string#owner-name a",
  );
  const channel = channelEl ? channelEl.textContent.toLowerCase() : "";
  console.log("[YT Tracker] Title:", title, "| Channel:", channel);

  const musicKeywords = [
    "song", "music", "lyrics", "official audio", "remix", "album", "acoustic", "piano", "guitar",
  ];
  const knowledgeKeywords = [
    "tutorial", "learn", "course", "how to", "explained", "science", "history",
    "documentary", "lecture", "programming", "coding", "education",
  ];
  const entertainmentKeywords = [
    "vlog", "funny", "comedy", "prank", "gaming", "reaction", "meme", "shorts",
    "trailer", "movie", "series",
  ];

  if (musicKeywords.some((k) => title.includes(k) || channel.includes(k))) return "music";
  if (knowledgeKeywords.some((k) => title.includes(k) || channel.includes(k))) return "knowledge";
  if (entertainmentKeywords.some((k) => title.includes(k) || channel.includes(k))) return "entertainment";
  return "other";
}

function getVideoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("v");
}

function stopTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
    console.log("[YT Tracker] Stopped tracking");
  }
}

function isExtensionValid() {
  try {
    return !!chrome.runtime?.id;
  } catch (e) {
    return false;
  }
}

function startTracking() {
  const videoId = getVideoId();
  if (!videoId) return;
  if (videoId === currentVideoId) return;

  stopTracking();
  currentVideoId = videoId;
  console.log("[YT Tracker] Started tracking video:", videoId);

  trackingInterval = setInterval(() => {
    // Stop gracefully if extension was reloaded/invalidated
    if (!isExtensionValid()) {
      console.log("[YT Tracker] Extension context invalidated, stopping.");
      stopTracking();
      return;
    }

    const video = document.querySelector("video");
    if (!video) {
      console.log("[YT Tracker] No video element found");
      return;
    }

    if (!video.paused) {
      const category = detectCategory();
      const today = new Date().toISOString().split("T")[0];
      console.log("[YT Tracker] Logging 5s to category:", category, "date:", today);

      try {
        chrome.runtime.sendMessage(
          { type: "ADD_TIME", payload: { category, seconds: 5, date: today } },
          (response) => {
            if (chrome.runtime.lastError) {
              // Suppress noisy "port closed" errors — they're harmless
            }
          },
        );
      } catch (e) {
        console.log("[YT Tracker] Could not send message, stopping:", e.message);
        stopTracking();
      }
    } else {
      console.log("[YT Tracker] Video is paused, not counting");
    }
  }, 5000);
}

// Detect YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("[YT Tracker] URL changed to:", currentUrl);
    if (currentUrl.includes("/watch")) {
      setTimeout(startTracking, 1500);
    } else {
      stopTracking();
      currentVideoId = null;
    }
  }
}).observe(document.body, { subtree: true, childList: true });

// Run on initial load
console.log("[YT Tracker] Content script loaded on:", location.href);
if (location.href.includes("/watch")) {
  setTimeout(startTracking, 1500);
}

window.addEventListener("beforeunload", stopTracking);

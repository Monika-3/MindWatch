let trackingInterval = null;
let currentVideoId = null;

function detectCategory() {
  const title = document.title.toLowerCase();

  const channelEl = document.querySelector(
    "#channel-name a, #owner-name a, yt-formatted-string#owner-name a",
  );

  const channel = channelEl ? channelEl.textContent.toLowerCase() : "";

  const musicKeywords = [
    "song",
    "music",
    "lyrics",
    "official audio",
    "remix",
    "album",
    "acoustic",
    "piano",
    "guitar",
  ];

  const knowledgeKeywords = [
    "tutorial",
    "learn",
    "course",
    "how to",
    "explained",
    "science",
    "history",
    "documentary",
    "lecture",
    "programming",
    "coding",
    "education",
  ];

  const entertainmentKeywords = [
    "vlog",
    "funny",
    "comedy",
    "prank",
    "gaming",
    "reaction",
    "meme",
    "shorts",
    "trailer",
    "movie",
    "series",
  ];

  if (musicKeywords.some((k) => title.includes(k) || channel.includes(k)))
    return "music";

  if (knowledgeKeywords.some((k) => title.includes(k) || channel.includes(k)))
    return "knowledge";

  if (
    entertainmentKeywords.some((k) => title.includes(k) || channel.includes(k))
  )
    return "entertainment";

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

function waitForVideo() {
  return new Promise((resolve) => {
    const check = () => {
      const video =
        document.querySelector("video.html5-main-video") ||
        document.querySelector("video");

      if (video) return resolve(video);

      setTimeout(check, 1000);
    };
    check();
  });
}

async function startTracking() {
  const videoId = getVideoId();
  if (!videoId) return;
  if (videoId === currentVideoId) return;

  stopTracking();
  currentVideoId = videoId;

  console.log("[YT Tracker] Starting tracking:", videoId);

  const video = await waitForVideo();

  trackingInterval = setInterval(() => {
    if (!video || video.paused) return;

    const category = detectCategory();
    const today = new Date().toISOString().split("T")[0];

    console.log("[YT Tracker] +5s →", category);

    chrome.runtime.sendMessage({
      type: "ADD_TIME",
      payload: {
        category,
        seconds: 5,
        date: today,
      },
    });
  }, 5000);
}

// 🔥 YouTube SPA navigation detector
let lastUrl = location.href;

const observer = new MutationObserver(() => {
  const currentUrl = location.href;

  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("[YT Tracker] URL changed:", currentUrl);

    if (currentUrl.includes("/watch")) {
      setTimeout(startTracking, 2000);
    } else {
      stopTracking();
      currentVideoId = null;
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// initial load
console.log("[YT Tracker] Content script loaded");

if (location.href.includes("/watch")) {
  setTimeout(startTracking, 2000);
}

window.addEventListener("beforeunload", stopTracking);

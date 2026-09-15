const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujrati");

const DEFAULT_LANG = "English";
const STORAGE_KEY = "selectedLanguage";

// translations come from assets/js/data.js, which must be loaded first
let translations = typeof data !== "undefined" ? data : {};

// set active button
function setActiveButton(activeBtn) {
  [btnEn, btnHi, btnGu].forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

// apply language
function applyLanguage(lang) {
  const langData = translations[lang];
  if (!langData) return;

  document.documentElement.lang = lang;

  if (lang === "English") {
    document.body.setAttribute("data-lang", "en");
    setActiveButton(btnEn);
  } else if (lang === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
    setActiveButton(btnHi);
  } else if (lang === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
    setActiveButton(btnGu);
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");
    if (langData[key] !== undefined) {
      el.innerHTML = String(langData[key]).replace(/\n/g, "<br>");
    }
  });

  localStorage.setItem(STORAGE_KEY, lang);
}

// detect refresh
function isPageRefresh() {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0) {
    return navEntries[0].type === "reload";
  }
  return performance.navigation.type === 1;
}

// load language
window.addEventListener("DOMContentLoaded", () => {
  if (!Object.keys(translations).length) {
    console.error(
      "Translations not loaded: include assets/js/data.js before this script",
    );
  }

  let langToApply = DEFAULT_LANG;
  const savedLang = localStorage.getItem(STORAGE_KEY);

  if (isPageRefresh()) {
    // on refresh always reset to English
    langToApply = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
  } else {
    // on normal page load / navigation keep selected language
    langToApply = savedLang || DEFAULT_LANG;
  }

  applyLanguage(langToApply);
});

// button clicks
if (btnEn) {
  btnEn.addEventListener("click", () => {
    playLangSound("English");
    applyLanguage("English");
  });
}
if (btnHi) {
  btnHi.addEventListener("click", () => {
    playLangSound("Hindi");
    applyLanguage("Hindi");
  });
}
if (btnGu) {
  btnGu.addEventListener("click", () => {
    playLangSound("Gujarati");
    applyLanguage("Gujarati");
  });
}

/* ==================================================
   AUDIO
   Shared across every page (this file is loaded everywhere), delegated so it
   still works for elements added dynamically after this script runs.
=================================================== */

const AUDIO_PATH = "./assets/audio/";
const MAX_NAV_WAIT = 600;

const LANG_SFX = {
  English: new Audio(`${AUDIO_PATH}Eng.mpeg`),
  Hindi: new Audio(`${AUDIO_PATH}Hin.mpeg`),
  Gujarati: new Audio(`${AUDIO_PATH}Guj.mpeg`),
};

const clickAudio = new Audio(`${AUDIO_PATH}click.mp3`);
const topicAudio = new Audio(`${AUDIO_PATH}topic.mp3`);
const swiperAudio = new Audio(`${AUDIO_PATH}swiper.mp3`);

function playLangSound(lang) {
  const audio = LANG_SFX[lang];
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function playSwiperSound() {
  swiperAudio.currentTime = 0;
  swiperAudio.play().catch(() => {});
}

// play a sound, then leave the page once it finishes (or the wait cap is hit)
function playThenNavigate(audio, url) {
  let navigated = false;

  const go = () => {
    if (navigated) return;
    navigated = true;
    window.location.href = url;
  };

  audio.currentTime = 0;
  audio.addEventListener("ended", go, { once: true });

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(go);
  }

  setTimeout(go, MAX_NAV_WAIT);
}

document.addEventListener("click", (e) => {
  const navBtn = e.target.closest(
    ".custom-prev, .custom-next, .prev-btn, .next-btn",
  );
  if (navBtn) {
    playSwiperSound();
    return;
  }

  const homeOrBack = e.target.closest(".home-button, .home-btn-1, .back-btn");
  if (homeOrBack && homeOrBack.tagName === "A") {
    const href = homeOrBack.getAttribute("href");
    if (href && href !== "#") {
      e.preventDefault();
      playThenNavigate(clickAudio, href);
    }
    return;
  }

  const topicLink = e.target.closest("a.topic");
  if (topicLink) {
    const href = topicLink.getAttribute("href");
    if (href && href !== "#") {
      e.preventDefault();
      playThenNavigate(topicAudio, href);
    }
  }
});


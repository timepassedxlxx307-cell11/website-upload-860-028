import { H as Hls } from "./hls-dru42stk.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function setupHero() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const panelImage = slider.querySelector("[data-hero-panel-image]");
  const panelTitle = slider.querySelector("[data-hero-panel-title]");
  const panelDesc = slider.querySelector("[data-hero-panel-desc]");
  const panelLink = slider.querySelector("[data-hero-panel-link]");
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    const active = slides[index];
    if (active && panelImage && panelTitle && panelDesc && panelLink) {
      panelImage.src = active.dataset.poster;
      panelImage.alt = active.dataset.title;
      panelTitle.textContent = active.dataset.title;
      panelDesc.textContent = active.dataset.desc;
      panelLink.href = active.dataset.href;
    }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => show(i));
  });

  show(0);

  if (slides.length > 1) {
    window.setInterval(() => show(index + 1), 5200);
  }
}

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function setupFilters() {
  const input = document.querySelector("[data-search-input]");
  const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const empty = document.querySelector("[data-empty-state]");
  let activeCategory = "all";

  function apply() {
    const query = normalize(input ? input.value : "");
    let shown = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search);
      const category = card.dataset.category || "";
      const matchQuery = !query || haystack.includes(query);
      const matchCategory = activeCategory === "all" || category === activeCategory;
      const visible = matchQuery && matchCategory;
      card.classList.toggle("hidden", !visible);
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", shown === 0);
    }
  }

  if (input) {
    input.addEventListener("input", apply);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.filterChip || "all";
      chips.forEach((item) => item.classList.toggle("active", item === chip));
      apply();
    });
  });

  apply();
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((box) => {
    const video = box.querySelector("video");
    const cover = box.querySelector("[data-player-cover]");
    const button = box.querySelector("[data-play-button]");
    const status = box.querySelector("[data-player-status]");
    const source = box.dataset.src;

    if (!video || !source) {
      return;
    }

    let loading = false;
    let loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function loadSource() {
      if (loaded || loading) {
        return Promise.resolve();
      }

      loading = true;
      setStatus("正在加载高清片源");

      return new Promise((resolve) => {
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          video._hls = hls;
          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            loaded = true;
            loading = false;
            setStatus("点击画面可暂停或继续");
            resolve();
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              loading = false;
              setStatus("视频暂时无法播放");
              resolve();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", () => {
            loaded = true;
            loading = false;
            setStatus("点击画面可暂停或继续");
            resolve();
          }, { once: true });
          video.load();
        } else {
          loading = false;
          setStatus("当前浏览器不支持此视频格式");
          resolve();
        }
      });
    }

    async function togglePlay() {
      await loadSource();

      if (video.paused) {
        try {
          await video.play();
          box.classList.add("playing");
        } catch (error) {
          setStatus("点击播放按钮开始观看");
        }
      } else {
        video.pause();
        box.classList.remove("playing");
      }
    }

    if (button) {
      button.addEventListener("click", togglePlay);
    }

    if (cover) {
      cover.addEventListener("click", togglePlay);
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", () => {
      box.classList.add("playing");
      setStatus("点击画面可暂停或继续");
    });
    video.addEventListener("pause", () => {
      box.classList.remove("playing");
      setStatus("点击播放按钮开始观看");
    });
  });
}

ready(() => {
  setupMenu();
  setupHero();
  setupFilters();
  setupPlayers();
});

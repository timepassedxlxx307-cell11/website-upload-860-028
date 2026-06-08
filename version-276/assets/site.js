(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function openSearch(form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
    });
  }

  function initHeader() {
    var header = $(".site-header");
    var menuButton = $(".menu-toggle");
    var mobileNav = $(".mobile-nav");

    if (header) {
      var updateHeader = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 30);
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var nextState = !mobileNav.classList.contains("is-open");
        mobileNav.classList.toggle("is-open", nextState);
        menuButton.setAttribute("aria-expanded", String(nextState));
      });
    }

    $all(".header-search, .mobile-search").forEach(openSearch);
  }

  function initHero() {
    var hero = $(".hero");
    if (!hero) {
      return;
    }

    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dots button", hero);
    var prev = $(".hero-arrow.prev", hero);
    var next = $(".hero-arrow.next", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initPageFilter() {
    var input = $(".page-filter-input");
    var cards = $all(".js-filter-card");
    if (!input || !cards.length) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '<a href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<div class="movie-cover">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div class="movie-hover"><span class="play-circle">▶</span></div>',
      '<span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '<span class="rating">★ ' + escapeHtml(movie.rating) + '</span>',
      '</div>',
      '<div class="movie-info">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.category) + '</span>',
      '</div>',
      '<p class="movie-card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];
    });
  }

  function initSearchPage() {
    var searchRoot = $(".search-results");
    var form = $(".search-hero");
    var input = form ? form.querySelector('input[name="q"]') : null;
    var empty = $(".empty-state");
    if (!searchRoot || !form || !input || !window.MOVIES) {
      return;
    }

    function runSearch(query) {
      var value = query.trim().toLowerCase();
      if (!value) {
        searchRoot.innerHTML = "";
        if (empty) {
          empty.style.display = "block";
        }
        return;
      }

      var terms = value.split(/\s+/).filter(Boolean);
      var results = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.category,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.summary,
          movie.year
        ].join(" ").toLowerCase();

        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 96);

      if (!results.length) {
        searchRoot.innerHTML = "";
        if (empty) {
          empty.style.display = "block";
        }
        return;
      }

      if (empty) {
        empty.style.display = "none";
      }

      searchRoot.innerHTML = '<div class="movie-grid">' + results.map(renderSearchCard).join("") + "</div>";
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    runSearch(initial);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      window.history.replaceState(null, "", nextUrl);
      runSearch(query);
    });
  }

  function initPlayer() {
    var video = $(".movie-player");
    var button = $(".player-start");
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute("data-src");
    var hlsInstance = null;
    var initialized = false;

    function attachSource() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      playVideo();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
    initPageFilter();
    initSearchPage();
    initPlayer();
  });
})();

(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.js-movie-grid').forEach(function (grid) {
    var scope = grid.closest('.page-section') || document;
    var searchInput = scope.querySelector('.js-search-input');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('.js-filter-select'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function matchesText(card, query) {
      if (!query) {
        return true;
      }
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      return haystack.indexOf(query) !== -1;
    }

    function matchesSelect(card, select) {
      var value = select.value;
      if (!value) {
        return true;
      }
      var field = select.getAttribute('data-filter') || '';
      var data = card.getAttribute('data-' + field) || '';
      return data.indexOf(value) !== -1;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var visible = matchesText(card, query) && selects.every(function (select) {
          return matchesSelect(card, select);
        });
        card.classList.toggle('is-filter-hidden', !visible);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        searchInput.value = initial;
      }
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  });

  document.querySelectorAll('[data-player]').forEach(function (frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.play-overlay');
    var hlsInstance = null;

    function loadAndPlay() {
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-hls');
      if (!url) {
        return;
      }

      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.dataset.ready = '1';
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          video.dataset.ready = '1';
        } else {
          video.src = url;
          video.dataset.ready = '1';
        }
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', loadAndPlay);
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      if (event.target && event.target.closest && event.target.closest('button, a')) {
        return;
      }
      loadAndPlay();
    });

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();

(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    start();
  }

  all('[data-search-input]').forEach(function (input) {
    var scope = input.closest('section') || document;
    var clearButton = scope.querySelector('[data-clear-search]');
    var cards = all('[data-card]', scope);

    function filter() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden', value && text.indexOf(value) === -1);
      });
    }

    input.addEventListener('input', filter);

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        input.value = '';
        filter();
        input.focus();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      input.value = query;
      filter();
    }
  });

  all('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('button');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function attach() {
      var streamUrl = video.getAttribute('data-stream');

      if (!streamUrl || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      shell.classList.add('is-playing');
      attach();
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function () {
      if (!loaded) {
        play();
        return;
      }

      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();

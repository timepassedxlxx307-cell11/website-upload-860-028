document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5600);
    }
  }

  var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  filterScopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var year = scope.querySelector('[data-filter-year]');
    var category = scope.querySelector('[data-filter-category]');
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    var applyFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1 && (card.getAttribute('data-title') || '').toLowerCase().indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }
        if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    };

    [input, region, type, year, category].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
});

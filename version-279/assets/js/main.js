(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");

        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var index = 0;

            function showSlide(nextIndex) {
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

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });

            window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
            var grid = input.closest("main").querySelector("[data-card-grid]");

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    card.hidden = keyword && text.indexOf(keyword) === -1;
                });
            });
        });

        var searchGrid = document.getElementById("searchGrid");

        if (searchGrid) {
            var searchInput = document.getElementById("movieSearch");
            var typeFilter = document.getElementById("typeFilter");
            var regionFilter = document.getElementById("regionFilter");
            var yearFilter = document.getElementById("yearFilter");
            var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));

            function applySearch() {
                var keyword = (searchInput.value || "").trim().toLowerCase();
                var type = typeFilter.value;
                var region = regionFilter.value;
                var year = yearFilter.value;

                searchCards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (type && card.getAttribute("data-type") !== type) {
                        matched = false;
                    }

                    if (region && card.getAttribute("data-region") !== region) {
                        matched = false;
                    }

                    if (year && card.getAttribute("data-year") !== year) {
                        matched = false;
                    }

                    card.hidden = !matched;
                });
            }

            [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
                control.addEventListener("input", applySearch);
                control.addEventListener("change", applySearch);
            });
        }
    });
})();

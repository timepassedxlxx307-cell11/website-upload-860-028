(function () {
    "use strict";

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = all("[data-hero-slide]", carousel);
        var dots = all("[data-hero-dot]", carousel);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function initSearch() {
        all("[data-search-form]").forEach(function (form) {
            var scope = form.parentElement;
            var cards = all("[data-search]", scope);
            if (!cards.length) {
                cards = all("[data-search]");
            }

            function filter() {
                var query = String((form.elements.q && form.elements.q.value) || "").trim().toLowerCase();
                var type = String((form.elements.type && form.elements.type.value) || "").trim();
                var year = String((form.elements.year && form.elements.year.value) || "").trim();
                cards.forEach(function (card) {
                    var text = String(card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = String(card.getAttribute("data-type") || "");
                    var cardYear = String(card.getAttribute("data-year") || "");
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    card.classList.toggle("is-filtered-out", !matched);
                });
            }

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                filter();
            });
            form.addEventListener("input", filter);
            form.addEventListener("reset", function () {
                window.setTimeout(filter, 0);
            });
        });
    }

    function initOverlayKeyboard() {
        all(".player-overlay").forEach(function (overlay) {
            overlay.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    overlay.click();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initSearch();
        initOverlayKeyboard();
    });
}());

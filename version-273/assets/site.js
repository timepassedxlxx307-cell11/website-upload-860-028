(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var previous = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
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
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        if (slides.length > 1) {
            start();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupFilters() {
        var panel = document.querySelector(".filter-panel");
        var grid = document.querySelector(".filter-grid");
        if (!panel || !grid) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var yearSelect = panel.querySelector("[data-filter-select='year']");
        var typeSelect = panel.querySelector("[data-filter-select='type']");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-item"));
        var empty = document.querySelector(".empty-result");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }

        function applyFilters() {
            var words = normalize(input ? input.value : "").split(/\s+/).filter(Boolean);
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matchedWords = words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
                var matchedYear = !year || cardYear === year;
                var matchedType = !type || cardType.indexOf(type) !== -1;
                var show = matchedWords && matchedYear && matchedType;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilters);
        }
        applyFilters();
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.querySelector(".movie-player");
        var overlay = document.querySelector(".player-overlay");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !sourceUrl) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            loaded = true;
        }

        function play() {
            loadSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
}());

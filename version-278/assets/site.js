(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var isOpen = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!isOpen));
                panel.hidden = isOpen;
            });
        }

        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });

        var hero = document.querySelector(".hero-carousel");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var previous = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function startTimer() {
                stopTimer();
                timer = window.setInterval(function () {
                    showSlide(index + 1);
                }, 5000);
            }

            function stopTimer() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (previous) {
                previous.addEventListener("click", function () {
                    showSlide(index - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                    startTimer();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-target") || 0));
                    startTimer();
                });
            });

            hero.addEventListener("mouseenter", stopTimer);
            hero.addEventListener("mouseleave", startTimer);
            showSlide(0);
            startTimer();
        }

        var searchPanel = document.querySelector(".search-panel");
        if (searchPanel) {
            var searchInput = searchPanel.querySelector(".search-input");
            var searchForm = searchPanel.querySelector(".search-page-form");
            var buttons = Array.prototype.slice.call(searchPanel.querySelectorAll(".filter-line button"));
            var sortSelect = searchPanel.querySelector(".sort-select");
            var count = searchPanel.querySelector(".search-count");
            var results = searchPanel.querySelector(".search-results");
            var cards = Array.prototype.slice.call(searchPanel.querySelectorAll(".search-card"));
            var params = new URLSearchParams(window.location.search);
            var category = "全部";

            if (searchInput) {
                searchInput.value = params.get("q") || "";
            }

            function applySearch() {
                var query = normalize(searchInput ? searchInput.value : "");
                var visible = [];

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesCategory = category === "全部" || cardCategory === category;
                    var isVisible = matchesQuery && matchesCategory;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible.push(card);
                    }
                });

                var sortValue = sortSelect ? sortSelect.value : "views";
                visible.sort(function (a, b) {
                    if (sortValue === "date") {
                        return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
                    }
                    if (sortValue === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                    }
                    return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
                });

                if (results) {
                    visible.forEach(function (card) {
                        results.appendChild(card);
                    });
                }

                if (count) {
                    count.textContent = "显示 " + visible.length + " 部影片";
                }
            }

            if (searchForm) {
                searchForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    applySearch();
                });
            }

            if (searchInput) {
                searchInput.addEventListener("input", applySearch);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    category = button.getAttribute("data-category") || "全部";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    applySearch();
                });
            });

            if (sortSelect) {
                sortSelect.addEventListener("change", applySearch);
            }

            applySearch();
        }

        var localInput = document.querySelector(".local-filter-input");
        if (localInput) {
            var rows = Array.prototype.slice.call(document.querySelectorAll(".ranking-row"));
            localInput.addEventListener("input", function () {
                var query = normalize(localInput.value);
                rows.forEach(function (row) {
                    var text = normalize(row.getAttribute("data-search"));
                    row.hidden = query && text.indexOf(query) === -1;
                });
            });
        }
    });
}());

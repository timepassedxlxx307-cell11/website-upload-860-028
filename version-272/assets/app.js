function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function bindMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
        return;
    }
    button.addEventListener("click", function () {
        nav.classList.toggle("open");
    });
}

function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    var index = 0;
    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }
    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
        });
    });
    window.setInterval(function () {
        show(index + 1);
    }, 5200);
}

function getQueryText() {
    try {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    } catch (error) {
        return "";
    }
}

function bindSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!input || !cards.length) {
        return;
    }
    function filter() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.innerText + " " + (card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    }
    var query = getQueryText();
    if (query) {
        input.value = query;
    }
    input.addEventListener("input", filter);
    filter();
}

function initPlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("play-button");
    if (!video || !button || !streamUrl) {
        return;
    }
    var attached = false;
    function attach() {
        if (attached) {
            return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1200);
            });
        }
        video.src = streamUrl;
        return Promise.resolve();
    }
    function play() {
        attach().then(function () {
            button.classList.add("hidden");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("hidden");
                });
            }
        });
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (!attached || video.paused) {
            play();
        }
    });
}

ready(function () {
    bindMenu();
    bindHero();
    bindSearch();
});

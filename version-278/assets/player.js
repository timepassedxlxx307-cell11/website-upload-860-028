(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }
        var minutes = Math.floor(seconds / 60);
        var rest = Math.floor(seconds % 60).toString().padStart(2, "0");
        return minutes + ":" + rest;
    }

    function setupPlayer(player) {
        var video = player.querySelector("video");
        var source = player.getAttribute("data-src") || "";
        var startButton = player.querySelector(".player-start");
        var playButton = player.querySelector(".player-play");
        var muteButton = player.querySelector(".player-mute");
        var fullscreenButton = player.querySelector(".player-fullscreen");
        var progress = player.querySelector(".player-progress");
        var time = player.querySelector(".player-time");
        var state = player.querySelector(".player-state");
        var error = player.querySelector(".player-error");
        var hlsInstance = null;
        var initialized = false;

        if (!video || !source) {
            if (error) {
                error.hidden = false;
            }
            return;
        }

        function setLoading(isLoading) {
            if (state) {
                state.hidden = !isLoading;
            }
        }

        function showError() {
            if (error) {
                error.hidden = false;
            }
            setLoading(false);
        }

        function initialize() {
            if (initialized) {
                return;
            }
            initialized = true;
            setLoading(true);

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setLoading(false);
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        showError();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setLoading(false);
                }, { once: true });
            } else {
                video.src = source;
                setLoading(false);
            }
        }

        function play() {
            initialize();
            video.play().catch(function () {
                showError();
            });
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        function updateTime() {
            if (progress) {
                progress.max = video.duration || 0;
                progress.value = video.currentTime || 0;
            }
            if (time) {
                time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
            }
        }

        if (startButton) {
            startButton.addEventListener("click", togglePlay);
        }

        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }

        video.addEventListener("click", togglePlay);
        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("durationchange", updateTime);
        video.addEventListener("loadedmetadata", updateTime);
        video.addEventListener("waiting", function () {
            setLoading(true);
        });
        video.addEventListener("canplay", function () {
            setLoading(false);
        });
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
            player.classList.remove("is-paused");
            if (playButton) {
                playButton.textContent = "暂停";
            }
        });
        video.addEventListener("pause", function () {
            player.classList.remove("is-playing");
            player.classList.add("is-paused");
            if (playButton) {
                playButton.textContent = "▶";
            }
        });
        video.addEventListener("error", showError);

        if (progress) {
            progress.addEventListener("input", function () {
                video.currentTime = Number(progress.value || 0);
                updateTime();
            });
        }

        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "已静音" : "音量";
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll(".site-player").forEach(setupPlayer);
    });
}());

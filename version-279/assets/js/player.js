(function () {
    window.attachMoviePlayer = function (playerId, streamUrl) {
        var player = document.getElementById(playerId);

        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var overlay = player.querySelector(".player-overlay");
        var hls = null;
        var bound = false;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function startVideo() {
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function bindStream(onReady) {
            if (bound) {
                onReady();
                return;
            }

            bound = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    onReady();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                onReady();
            }
        }

        function playFromClick() {
            overlay.classList.add("is-hidden");
            bindStream(startVideo);
        }

        overlay.addEventListener("click", playFromClick);

        video.addEventListener("click", function () {
            if (video.paused) {
                playFromClick();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();

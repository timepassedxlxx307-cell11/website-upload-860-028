function initMoviePlayer(videoId, coverId, source) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;
  var started = false;

  if (!video || !source) {
    return;
  }

  var attachSource = function () {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  var startPlayback = function () {
    attachSource();

    if (cover) {
      cover.classList.add('hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  };

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!started) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}

(function () {
  "use strict";

  const SOUND_DIR = "assets/sounds/";
  const cache = {};   // name -> HTMLAudioElement (created once, reused)
  let playing = null; // the audio element that is currently playing

  function getAudio(name) {
    if (!cache[name]) {
      const a = new Audio(SOUND_DIR + name + ".wav");
      a.preload = "auto";
      a.addEventListener("error", () => {
        // Missing or unreadable file: fail silently so the page looks normal.
        a.dataset.failed = "1";
        console.warn("Sound file could not be loaded:", SOUND_DIR + name + ".wav");
      });
      cache[name] = a;
    }
    return cache[name];
  }

  function stopCurrent() {
    if (playing) {
      playing.pause();
      try { playing.currentTime = 0; } catch (e) { /* not seekable yet */ }
      playing = null;
    }
  }

  function playSound(name) {
    stopCurrent();
    const a = getAudio(name);
    if (a.dataset.failed) return;
    try { a.currentTime = 0; } catch (e) { /* ignore */ }
    playing = a;
    const p = a.play();
    if (p) {
      p.catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Sound failed:", name);
        }
      });
    }
    a.onended = () => { if (playing === a) playing = null; };
  }

  document.addEventListener("click", (event) => {
    const el = event.target.closest && event.target.closest("[data-sound]");
    if (!el) return;
    // Links keep navigating (hash scroll). Everything else must not submit or reload.
    if (el.tagName !== "A") {
      event.preventDefault();
    }
    playSound(el.dataset.sound);
  });

  // Preload every sound in the background (does NOT play anything).
  document.querySelectorAll("[data-sound]").forEach((el) => getAudio(el.dataset.sound));
})();

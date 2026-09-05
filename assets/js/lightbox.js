(function () {
  "use strict";

  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var imageEl = lightbox.querySelector(".lightbox-image");
  var counterEl = lightbox.querySelector(".lightbox-counter");
  var prevBtn = lightbox.querySelector(".lightbox-prev");
  var nextBtn = lightbox.querySelector(".lightbox-next");
  var closeBtn = lightbox.querySelector(".lightbox-close");

  var images = [];
  var index = 0;

  function render() {
    imageEl.src = images[index];
    var multi = images.length > 1;
    counterEl.textContent = multi ? (index + 1) + " / " + images.length : "";
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  }

  function open(newImages, startIndex) {
    images = newImages;
    index = startIndex;
    render();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function prev() {
    index = (index - 1 + images.length) % images.length;
    render();
  }

  function next() {
    index = (index + 1) % images.length;
    render();
  }

  // Delegated on `document` (not bound per-thumbnail) so it also covers
  // post-cards appended later by feed.js's infinite scroll.
  document.addEventListener("click", function (e) {
    var thumb = e.target.closest(".post-thumb");
    if (thumb) {
      var gallery = thumb.closest(".post-gallery");
      if (!gallery) return;
      var imgs;
      try {
        imgs = JSON.parse(gallery.getAttribute("data-images"));
      } catch (err) {
        return;
      }
      open(imgs, parseInt(thumb.getAttribute("data-index"), 10) || 0);
      return;
    }

    if (lightbox.hidden) return;
    if (e.target === closeBtn || e.target === lightbox) close();
    else if (e.target === prevBtn) prev();
    else if (e.target === nextBtn) next();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  });
})();

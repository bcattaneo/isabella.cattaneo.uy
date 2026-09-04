(function () {
  "use strict";

  var feed = document.getElementById("feed");
  var loadMoreWrap = document.getElementById("load-more-wrap");
  var loadMoreLink = document.getElementById("load-more");
  if (!feed || !loadMoreLink || !loadMoreWrap) return;

  var loading = false;

  function loadNext() {
    var nextUrl = feed.getAttribute("data-next");
    if (!nextUrl || loading) return;
    loading = true;
    loadMoreLink.textContent = "Cargando…";

    fetch(nextUrl)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var nextFeed = doc.getElementById("feed");
        if (!nextFeed) {
          loadMoreWrap.remove();
          return;
        }
        Array.prototype.forEach.call(nextFeed.children, function (card) {
          feed.appendChild(card);
        });
        var nextNext = nextFeed.getAttribute("data-next") || "";
        feed.setAttribute("data-next", nextNext);
        if (nextNext) {
          loadMoreLink.textContent = "Cargar más";
        } else {
          loadMoreWrap.remove();
        }
      })
      .catch(function () {
        loadMoreLink.textContent = "Cargar más";
      })
      .finally(function () {
        loading = false;
      });
  }

  loadMoreLink.addEventListener("click", function (e) {
    e.preventDefault();
    loadNext();
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) loadNext();
      });
    });
    observer.observe(loadMoreWrap);
  }
})();

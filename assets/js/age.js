(function () {
  "use strict";

  var el = document.getElementById("site-age");
  if (!el) return;

  var BIRTH = new Date("2026-08-27T23:42:00-03:00");

  function pluralize(n, singular, plural) {
    return n + " " + (n === 1 ? singular : plural);
  }

  function render() {
    var now = new Date();
    var years = now.getFullYear() - BIRTH.getFullYear();
    var months = now.getMonth() - BIRTH.getMonth();
    var days = now.getDate() - BIRTH.getDate();

    if (days < 0) {
      months -= 1;
      var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years >= 1) {
      el.textContent = months === 0
        ? pluralize(years, "año", "años")
        : pluralize(years, "año", "años") + " y " + pluralize(months, "mes", "meses");
    } else {
      var totalDays = Math.floor((now - BIRTH) / 86400000);
      el.textContent = pluralize(totalDays, "día", "días");
    }
  }

  render();
})();

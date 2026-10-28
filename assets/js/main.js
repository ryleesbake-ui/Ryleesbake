/* Rylee's Bake — page behavior. Class data lives in classes.js. */
(function () {
  "use strict";

  var TZ = "America/New_York";
  var types = window.RB_CLASS_TYPES || {};
  var info = window.RB_INFO || {};
  // Merge each date with its class type so cards have name, price, etc.
  var classes = (window.RB_CLASSES || []).map(function (c) {
    var t = types[c.type] || {};
    return Object.assign({}, t, c, { price: c.price != null ? c.price : t.price });
  });

  /* ---------- Dates ---------- */

  // Offset (in minutes) of Eastern time on a given day, e.g. -300 in winter.
  function easternOffset(y, m, d) {
    try {
      var probe = new Date(Date.UTC(y, m - 1, d, 12));
      var part = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" })
        .formatToParts(probe).find(function (p) { return p.type === "timeZoneName"; });
      var match = /GMT([+-]\d+)(?::(\d+))?/.exec(part && part.value);
      if (match) return parseInt(match[1], 10) * 60 + (match[2] ? Math.sign(parseInt(match[1], 10)) * parseInt(match[2], 10) : 0);
    } catch (e) { /* older browsers fall through */ }
    return m >= 4 && m <= 10 ? -240 : -300;
  }

  // Build a real Date for "YYYY-MM-DD" + "HH:MM" Eastern.
  function at(id, time) {
    var p = id.split("-").map(Number);
    var t = time.split(":").map(Number);
    var offset = easternOffset(p[0], p[1], p[2]);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2], t[0], t[1]) - offset * 60000);
  }

  function fmt(date, opts) {
    return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts)).format(date);
  }
  function timeRange(c) {
    var o = { hour: "numeric", minute: "2-digit" };
    return fmt(at(c.id, c.start), o) + " – " + fmt(at(c.id, c.end), o);
  }
  function duration(c) {
    var mins = (at(c.id, c.end) - at(c.id, c.start)) / 60000;
    var h = Math.floor(mins / 60), half = mins % 60 >= 30;
    return "about " + h + (half ? "½" : "") + " hour" + (h === 1 && !half ? "" : "s");
  }
  function longDate(c) { return fmt(at(c.id, c.start), { weekday: "long", month: "long", day: "numeric" }); }
  function shortDate(c) { return fmt(at(c.id, c.start), { weekday: "short", month: "short", day: "numeric" }); }

  var now = new Date();
  var upcoming = classes
    .filter(function (c) { return at(c.id, c.end) > now; })
    .sort(function (a, b) { return at(a.id, a.start) - at(b.id, b.start); });

  /* ---------- Small helpers ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  var icon = {
    clock: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    seat: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  };

  function spotsBadge(c) {
    if (c.spotsLeft <= 0) return '<span class="badge badge--calm">Sold out</span>';
    if (c.spotsLeft <= Math.max(3, Math.ceil(c.capacity / 2))) return '<span class="badge">Only ' + c.spotsLeft + " spot" + (c.spotsLeft === 1 ? "" : "s") + " left</span>";
    return '<span class="badge badge--calm">' + c.spotsLeft + " spots open</span>";
  }

  /* ---------- Home page: class cards ---------- */

  var list = document.getElementById("class-list");
  if (list) {
    if (!upcoming.length) {
      list.innerHTML =
        '<div class="empty-state"><h3>New dates are on the way</h3>' +
        '<p>Follow along on <a href="' + esc(info.facebook) + '">Facebook</a> to hear first, or email ' +
        '<a href="mailto:' + esc(info.email) + '">' + esc(info.email) + "</a> to get on the list.</p></div>";
    } else {
      list.innerHTML = upcoming.map(function (c) {
        var start = at(c.id, c.start);
        var soldOut = c.spotsLeft <= 0;
        var cta = soldOut
          ? '<a class="btn btn--ghost" href="mailto:' + esc(info.email) + "?subject=" + encodeURIComponent("Waitlist for " + shortDate(c)) + '">Join the waitlist</a>'
          : '<a class="btn" href="' + esc(c.checkout) + '" data-class="' + esc(c.id) + '">Reserve my spot</a>';
        var price = c.price != null ? '<p class="price">$' + esc(c.price) + "<small>per person</small></p>" : "";
        return (
          '<article class="class-card">' +
            '<div class="class-card__top"><span class="class-card__name">' + esc(c.name) + "</span>" + spotsBadge(c) + "</div>" +
            '<div class="class-card__date">' +
              '<div class="cal" aria-hidden="true"><span class="cal__month">' + fmt(start, { month: "short" }) + '</span><span class="cal__day">' + fmt(start, { day: "numeric" }) + "</span></div>" +
              "<div><h3>" + longDate(c) + "</h3>" +
              (c.title ? '<p class="class-card__title">' + esc(c.title) + "</p>" : "") + "</div>" +
            "</div>" +
            '<ul class="class-card__meta">' +
              "<li>" + icon.clock + timeRange(c) + " · " + duration(c) + "</li>" +
              "<li>" + icon.pin + "Clermont, FL · address sent after booking</li>" +
              "<li>" + icon.seat + "Small group, " + c.capacity + " seats total</li>" +
            "</ul>" +
            (c.forWho ? '<p class="class-card__for"><strong>' + esc(c.forWho) + ".</strong> Bring: " + esc(c.bring) + "</p>" : "") +
            '<div class="class-card__foot">' + price + cta + "</div>" +
          "</article>"
        );
      }).join("");
    }
  }

  // "Next class" pill in the hero
  var next = document.getElementById("next-class");
  var firstOpen = upcoming.filter(function (c) { return c.spotsLeft > 0; })[0];
  if (next && firstOpen) {
    next.querySelector("[data-next-text]").textContent =
      "Next class: " + shortDate(firstOpen) + " · " +
      (firstOpen.spotsLeft <= 5 ? "only " + firstOpen.spotsLeft + " spots left" : firstOpen.spotsLeft + " spots open");
    next.hidden = false;
  }

  // Search-engine event listings for each upcoming class
  if (list && upcoming.length) {
    var events = upcoming.map(function (c) {
      var e = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: c.name + (c.title ? ": " + c.title : "") + " — Rylee's Bake",
        startDate: at(c.id, c.start).toISOString(),
        endDate: at(c.id, c.end).toISOString(),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        description: c.type === "201"
          ? "A hands-on sourdough discard class in Clermont, FL. Make cinnamon rolls, mix pizza dough to take home, taste discard appetizers and leave with a recipe bundle."
          : "A hands-on beginner sourdough class in Clermont, FL. Learn to feed a starter, mix, shape and bake, and take home your own dough, starter and kit.",
        image: [new URL("og-image.jpg", location.href).href],
        location: {
          "@type": "Place",
          name: "Rylee's Bake",
          address: { "@type": "PostalAddress", addressLocality: "Clermont", addressRegion: "FL", postalCode: "34715", addressCountry: "US" }
        },
        organizer: { "@type": "Organization", name: "Rylee's Bake", url: location.origin + location.pathname }
      };
      if (c.price != null) {
        e.offers = {
          "@type": "Offer", url: c.checkout, price: String(c.price), priceCurrency: "USD",
          availability: c.spotsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
        };
      }
      return e;
    });
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(events);
    document.head.appendChild(s);
  }

  /* ---------- Booked page ---------- */

  var booked = document.getElementById("booked-details");
  if (booked) {
    var wanted = new URLSearchParams(location.search).get("class");
    var c = classes.filter(function (x) { return x.id === wanted; })[0] || upcoming[0];
    var a = info.address || {};
    var oneLine = a.street + ", " + a.city + ", " + a.state + " " + a.zip;

    if (c) {
      document.querySelector("[data-when]").textContent = longDate(c) + " · " + timeRange(c);
      document.querySelector("[data-class-name]").textContent = c.name + (c.title ? ": " + c.title : "");
      document.querySelector("[data-bring]").textContent = c.bring || "";
      if (!wanted) document.querySelector("[data-when-note]").textContent = "If you booked a different date, your Square receipt shows it.";
    }
    document.querySelector("[data-address]").textContent = oneLine;
    document.querySelector("[data-directions]").href =
      "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(oneLine);

    var gcal = document.querySelector("[data-gcal]");
    var ics = document.querySelector("[data-ics]");
    if (c) {
      var stamp = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
      var s0 = stamp(at(c.id, c.start)), s1 = stamp(at(c.id, c.end));
      var title = c.name + " with Rylee's Bake";
      var details = "Hands-on sourdough class. What to bring: " + (c.bring || "just yourself") + " Questions: " + info.email;
      gcal.href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(title) + "&dates=" + s0 + "/" + s1 +
        "&location=" + encodeURIComponent(oneLine) + "&details=" + encodeURIComponent(details);
      ics.addEventListener("click", function (ev) {
        ev.preventDefault();
        var body = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rylee's Bake//Class//EN", "BEGIN:VEVENT",
          "UID:" + c.id + "@ryleesbake", "DTSTAMP:" + stamp(new Date()), "DTSTART:" + s0, "DTEND:" + s1,
          "SUMMARY:" + title, "LOCATION:" + oneLine.replace(/,/g, "\\,"), "DESCRIPTION:" + details.replace(/,/g, "\\,"),
          "END:VEVENT", "END:VCALENDAR"
        ].join("\r\n");
        var url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
        var link = document.createElement("a");
        link.href = url; link.download = "ryleesbake-" + c.id + ".ics";
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    } else {
      gcal.hidden = true; ics.hidden = true;
    }
  }

  /* ---------- Shared ---------- */

  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    var nav = toggle.closest(".nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("ul a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* ==========================================================================
   CLASSES — the only file to edit when dates or prices change.

   RB_CLASS_TYPES  The classes Rylee teaches (name, price, who it's for).
   RB_CLASSES      Scheduled dates. One entry per date. Past dates hide
                   themselves automatically once the class has ended.

   Date fields:
   id         The class date as YYYY-MM-DD. Also used in the Square
              redirect link: https://ryleesbake.com/booked.html?class=<id>
   type       "101" or "201" (must match a key in RB_CLASS_TYPES).
   start/end  24-hour time, Eastern.
   price      Optional. Leave out to use the class type's price.
   capacity   Total seats in the class.
   spotsLeft  Update after each booking. 0 shows "Sold out".
   checkout   The Square payment link for this date.
   ========================================================================== */

window.RB_CLASS_TYPES = {
  "101": {
    name: "Sourdough 101",
    title: "Sourdough Fundamentals",
    price: 90,
    forWho: "For complete beginners",
    bring: "Nothing but yourself. Everything is provided except a Dutch oven, which you'll need at home to bake your loaf."
  },
  "201": {
    name: "Sourdough 201",
    title: "Discard Recipes & Everyday Baking",
    price: 80,
    forWho: "For 101 grads, or anyone already keeping a starter",
    bring: "Your Sourdough 101 kit and your starter, or the equivalent supplies if you have your own setup."
  }
};

window.RB_CLASSES = [
  {
    id: "2026-11-14",
    type: "201",
    start: "11:30",
    end: "14:00",
    capacity: 10,
    spotsLeft: 5,
    checkout: "https://square.link/u/RKozbW85"
  },
  {
    id: "2026-12-12",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    spotsLeft: 8,
    checkout: "https://square.link/u/u55EVCgX"
  }
];

/* Shared business details used by both pages. */
window.RB_INFO = {
  name: "Rylee's Bake",
  email: "ryleesbake@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61573125724592",
  reviews: "https://www.facebook.com/profile.php?id=61573125724592&sk=reviews",
  privateClassForm: "https://docs.google.com/forms/d/e/1FAIpQLSfYBBfUP6SKK-DPc8k233DRJyjPu90RRjPOQ7ujXxhpwyw9_A/viewform",
  // Shown only on the booked page, after someone has paid.
  address: {
    street: "1335 Zeek Ridge St",
    city: "Clermont",
    state: "FL",
    zip: "34715"
  }
};

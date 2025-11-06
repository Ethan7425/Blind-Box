// presents.js — single source of truth for your presents
// Change CURRENT_ID to pick today's present.
// Add as many items as you like in PRESENTS.

const PRESENTS = [
  {
    id: "1",
    title: "Hi, you 🫶",
    message: `you found this little box — it’s a tiny space just for you.
sometimes it’ll hold pictures, sometimes words, sometimes little secrets.
today, it just wants to say…
i’m really glad you’re here.`,
    image: {
      src: "assets/other/cosmos.png",
      alt: "a little bouquet for you",
      caption: "a little cosmos bouquet for you"
    },
    date: "2025-11-06",
    showInMemories: false 
  },

  // add more presents below (copy this shape)
  // {
  //   id: "2",
  //   title: "Day 2 ✨",
  //   message: `short cute note here`,
  //   image: { src: "assets/...", alt: "...", caption: "..." },
  //   date: "2025-11-07"
  // },
];

let CURRENT_ID = "1"; // <-- switch this to change "today"

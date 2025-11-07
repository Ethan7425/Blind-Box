// presents.js — single source of truth for your presents
// Each present will automatically be included in the random pool.
// The weighted system makes new ones appear more often until they've been opened several times.

const PRESENTS = [
  {
    id: "1",
    title: "Hi, you 🫶",
    message: `you found this little box — it’s a tiny space just for you. 
sometimes it’ll hold pictures, sometimes words, sometimes little secrets. 
today, it just wants to say i’m really glad you’re here.`,
    image: { 
      src: "assets/other/cosmos.png", 
      alt: "a little bouquet for you", 
      caption: "a little cosmos bouquet for you" 
    },
    date: "2025-11-06",
  },

  {
    id: "2",
    title: "Hi, you 🫶",
    message: `These boxes will be some messages, quotes i find on Insta that make me think of you.
they could also be images like yesterday or videos, maybe even small games sometimes who knows —
the only goal is to make you smile and brighten your day a little. you matter for me.`,
    image: {
      src: "assets/other/quote1.jpg",
      alt: "a little quote for you",
      caption: "a little quote for you"
    },
    date: "2025-11-06",
    showInMemories: false // optional flag: hides from memories if you want
  },

  {
    id: "3",
    title: "If you could pause time ⏳",
    message: `If you could pause time anywhere for a little while — not forever, just to breathe — where would you stop it?  
    and what would you want to do in that still moment?`,
    // image: { src: "assets/other/pause.png", alt: "a quiet sunrise", caption: "time feels slower here" },
    date: "2025-11-07",
  },

  {
    id: "4",
    title: "Comforts 🌙",
    message: `What are the small things that always calm you down —  
    the sounds, smells, or textures that make you feel safe?  
    like, your personal recipe for peace.`,
    // image: { src: "assets/other/comfort.png", alt: "soft blanket and tea", caption: "little comfort rituals" },
    date: "2025-11-07",
  },

  {
    id: "5",
    title: "Dream corners ☁️",
    message: `If you could design a tiny secret room that exists only for you, what would it look like?  
    music, light, scent — describe it to me sometime.`,
    image: { src: "assets/other/dreamroom.png", alt: "a cozy glowing room", caption: "your own secret corner" },
    date: "2025-11-07",
  },

  {
    id: "6",
    title: "Memories that hum 🎵",
    message: `Sometimes songs attach to people or moments.  
    is there a song that still feels like a memory — not because of lyrics, but because of the feeling it leaves?`,
    // image: { src: "assets/other/song.png", alt: "music and nostalgia", caption: "melody that remembers" },
    date: "2025-11-07",
  },

  {
    id: "7",
    title: "Soft bravery 🌸",
    message: `There’s bravery that looks loud,  
    and bravery that just means you showed up again today.  
    what’s something quiet you did recently that you’re proud of?`,
    // image: { src: "assets/other/bravery.png", alt: "soft blooming flower", caption: "soft bravery still blooms" },
    date: "2025-11-07",
  },

  {
    id: "8",
    title: "tiny thought 🌷",
    message: `just a gentle reminder — you’re doing fine, even if today feels quiet.`,
    image: { src: "assets/other/quote2.png", alt: "soft pastel quote", caption: "a small thought for you" },
  },

  {
    id: "9",
    title: "tiny thought ☁️",
    message: `sometimes the calmest moments say the most. breathe, and let them stay for a bit.`,
    image: { src: "assets/other/quote3.png", alt: "soft pastel quote", caption: "breathe for a moment" },
  },

  {
    id: "10",
    title: "tiny thought ☕",
    message: `you don’t need to fix anything right now. it’s enough to just be here.`,
    image: { src: "assets/other/quote4.png", alt: "soft pastel quote", caption: "you’re allowed to rest" },
  },

  {
    id: "11",
    title: "tiny thought ✨",
    message: `maybe today isn’t about doing more, but about feeling a little lighter.`,
    image: { src: "assets/other/quote5.png", alt: "soft pastel quote", caption: "a light moment" },
  },

  {
    id: "12",
    title: "tiny thought 💌",
    message: `there’s still beauty in the small, slow things. maybe that’s what matters most.`,
    image: { src: "assets/other/quote6.png", alt: "soft pastel quote", caption: "soft beauty" },
  },

  {
    id: "13",
    title: "tiny thought 🌼",
    message: `take your time — nothing real will ever rush you.`,
    image: { src: "assets/other/quote7.png", alt: "soft pastel quote", caption: "time can be gentle" },
  },

  {
    id: "14",
    title: "tiny thought 🌙",
    message: `you’ve come further than you realize — it’s okay to pause and smile about it.`,
    image: { src: "assets/other/quote8.png", alt: "soft pastel quote", caption: "a pause to notice" },
  },

  {
    id: "15",
    title: "tiny thought 🕊️",
    message: `you don’t always have to be strong. some days, being soft is the braver thing.`,
    image: { src: "assets/other/quote9.png", alt: "soft pastel quote", caption: "soft is brave too" },
  },

  {
    id: "16",
    title: "tiny thought 🌸",
    message: `maybe today is just about gentle beginnings.`,
    image: { src: "assets/other/quote10.png", alt: "soft pastel quote", caption: "a gentle start" },
  },

  // {
  //   id: "17",
  //   title: "tiny thought ☔",
  //   message: `you’re allowed to slow down — the world will wait for you to catch your breath.`,
  //   image: { src: "assets/other/quote11.png", alt: "soft pastel quote", caption: "the world can wait" },
  // },



];


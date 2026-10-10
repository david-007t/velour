// Single source of truth for the three bodies of work. The split
// selector, category intro, film panels, nav, and URL routing all read
// from here, so a change in one place shows up everywhere.
//
// films: previewSrc = short muted loop shown full-screen;
//        fullSrc    = the file that plays with sound on request;
//        title      = optional (shown when present).
export const CONTACT_EMAIL = 'contact@veloure.studio';
export const CONTACT_LABEL = 'Discuss your project';

export const MISSION =
  "With the rise of AI, it's more important than ever to make content that is as human and emotional as possible. Every shot immortalizes priceless moments.";

export const CATEGORIES = [
  {
    id: 'speed',
    label: 'Speed',
    path: '/speed',
    description: 'High-energy films for sport, nightlife, and motion.',
    hero: { video: '/loops/hero.mp4', poster: '/speed-poster.jpg' },
    films: [
      { id: 'soccer-drone', duration: '0:05', previewSrc: '/loops/1of1.mp4',       fullSrc: '/1of1.mp4',       poster: '/posters/1of1.jpg' },
      { id: 'soccer-kid',   duration: '0:10', previewSrc: '/loops/final-1of1.mp4', fullSrc: '/final-1of1.mp4', poster: '/posters/final-1of1.jpg' },
      { id: 'afro-rave',    duration: '0:08', previewSrc: '/loops/afro-rave.mp4',  fullSrc: '/afro-rave.mp4',  poster: '/posters/afro-rave.jpg', lazy: true },
    ],
  },
  {
    id: 'focus',
    label: 'Focus',
    path: '/focus',
    description: 'Intimate films for weddings, celebrations, and the people in them.',
    hero: { video: '/loops/p2w-arcana.mp4', poster: '/focus-poster.jpg' },
    films: [
      { id: 'juice',      duration: '0:16', previewSrc: '/loops/focus.mp4',      fullSrc: '/focus.mp4',      poster: '/posters/focus.jpg' },
      { id: 'yomi-wunmi', duration: '0:08', previewSrc: '/loops/yomi-wunmi.mp4', fullSrc: '/yomi-wunmi.mp4', poster: '/posters/yomi-wunmi.jpg' },
    ],
  },
  {
    id: 'pulse',
    label: 'Pulse',
    path: '/pulse',
    description: 'Cinematic films for technology launches, founders, and events.',
    hero: { video: '/loops/pulse/robotics-story.mp4', poster: '/posters/pulse/robotics-story.jpg' },
    films: [
      { id: 'robotics-story',        title: 'Robotics Story',          duration: '2:10', previewSrc: '/loops/pulse/robotics-story.mp4',        fullSrc: '/media/pulse/robotics-story.mp4',        poster: '/posters/pulse/robotics-story.jpg' },
      { id: 'founder-product-story', title: 'Founder & Product Story', duration: '1:41', previewSrc: '/loops/pulse/founder-product-story.mp4', fullSrc: '/media/pulse/founder-product-story.mp4', poster: '/posters/pulse/founder-product-story.jpg' },
      { id: 'ai-product-promo',      title: 'AI Product Promo',        duration: '1:18', previewSrc: '/loops/pulse/ai-product-promo.mp4',      fullSrc: '/media/pulse/ai-product-promo.mp4',      poster: '/posters/pulse/ai-product-promo.jpg' },
    ],
  },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || null;

// /speed, /focus, /pulse (with or without trailing slash) → id.
export const categoryFromPath = (pathname) => {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  return CATEGORIES.find((c) => c.path === clean)?.id || null;
};

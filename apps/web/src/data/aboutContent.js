// About-page content, shared by AboutPage.jsx and tools/prerender.mjs.
//
// Kept out of the component so the prerendered body and the rendered page come
// from one source and cannot drift apart. Every quote is Lynn's own, from her
// Artist Statement and her category captions; the credentials come from her
// resume and the Marquis Who's Who release.

export const aboutHero = {
  heading: 'Three Decades in the Wild',
  standfirst:
    'Lynn Starnes is an award-winning wildlife photographer whose images have been recognized by the ' +
    'Smithsonian Institution. She has spent over thirty years pursuing North American wildlife in its ' +
    'most remote and extreme environments, from the Arctic to the ridgelines of the Sierra Nevada.',
};

export const aboutHeading = 'A biologist first, a photographer second';

/** type: 'p' for narration, 'quote' for Lynn's own words. */
export const aboutBody = [
  {
    type: 'p',
    text:
      'Lynn Starnes spent thirty-eight years as a fish and wildlife biologist — researching animals, ' +
      'running field studies, and managing habitat — before most people ever saw one of her photographs. ' +
      'She has a master’s degree in aquatic ecology, twenty-two years with the U.S. Fish and Wildlife ' +
      'Service behind her, and a Peace Corps posting in West Africa before that.',
  },
  {
    type: 'quote',
    text:
      'The advantage of being a biologist first and a photographer second is my knowledge of animal ' +
      'behavior and habitats. I see animals I am studying eating, sleeping, in their mating rituals, and ' +
      'even playing. Most tourists who visit America’s wild lands rarely have the time to let animals ' +
      'acclimate to their presence, so they rarely see animals being wild, natural, relaxed animals.',
  },
  {
    type: 'p',
    text:
      'She calls herself an “ambush photographer.” There is no posing a bull elk. What she does ' +
      'instead is wait — sometimes passing up the early, easy shots entirely — until an animal forgets ' +
      'she is there.',
  },
  {
    type: 'quote',
    text:
      'Photography for me is fundamentally a waiting game. I wait for the animal to exhibit postures that ' +
      'I think are expressive. The expression of the animal, such as the eyes looking directly into the ' +
      'lens, or the position of the body, will make the difference between a marketable and possibly ' +
      'award-winning image or a throw away.',
  },
  {
    type: 'p',
    text:
      'That patience is what produced the polar bear photograph judged in the top 25 of almost 70,000 ' +
      'entries for Nature’s Best / Smithsonian in 2018 — made during two weeks at the Arctic Circle in ' +
      'weather that never rose above −27 °F, and dropped as low as −46 °F as ' +
      'Hudson Bay froze over and the bears began hunting seals, their first food in months.',
  },
  {
    type: 'p',
    text:
      'Every photograph sold here was made in the wild. Nothing is staged and nothing is posed. It is the ' +
      'animal, the light, and however long it took.',
  },
  {
    type: 'quote',
    text:
      'Hopefully, I can inspire you to love these wild animals that have been my life, and to help ' +
      'conserve these wild animals and their habitats for future generations.',
  },
];

export const aboutCredentials = [
  {
    label: 'Education',
    lines: [
      'B.S. Zoology, University of Tennessee (1972)',
      'M.S. Aquatic Ecology, University of Tennessee (1976)',
    ],
  },
  {
    label: 'Career',
    lines: [
      'U.S. Fish and Wildlife Service, 1984–2006',
      'Tennessee Valley Authority, 1974–1984',
      'Peace Corps, West Africa, 1972–1974',
    ],
  },
  {
    label: 'Recognition',
    lines: [
      'Top 25, Nature’s Best / Smithsonian, 2018',
      'Registered Fisheries Scientist, American Fisheries Society',
    ],
  },
  {
    label: 'Conservation',
    lines: [
      'Nevada Bighorns Unlimited · Wild Sheep Foundation · Rocky Mountain Elk Foundation',
    ],
  },
];

export const aboutPortrait = {
  jpg: '/images/lynn-starnes-in-the-blind.jpg',
  webp: '/images/lynn-starnes-in-the-blind.webp',
  alt: 'Lynn Starnes photographing from inside a camouflaged blind, behind a large telephoto lens',
  caption:
    'Lynn at work — waiting inside a blind, behind the long lens. Most of wildlife photography is the waiting.',
  width: 756,
  height: 784,
};

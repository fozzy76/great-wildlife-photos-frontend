// Collection landing pages — one per category in the catalogue.
//
// Imported by BOTH the React CollectionPage and tools/prerender.mjs, the same
// single-source-of-truth pattern as aboutContent.js and faqs.js. Duplicating this
// copy into the prerender would drift the first time anyone edits a component.
//
// 🔴 AUTHORSHIP MATTERS HERE. `author: 'lynn'` means the intro is Lynn Starnes'
// own writing, taken verbatim from `N:\Clients\Great Wildlife Photos\Collections\
// Captions for First 6 Categories..docx`. Her copy is first-person and personal —
// it is the reason these pages are worth having. Do not paraphrase it, do not
// "improve" it, and do not extend it in her voice.
//
// `author: '76ds'` means Lynn has written nothing for that collection yet and the
// intro is factual natural-history description only — no first-person, no invented
// field stories, no claims about her experience. This is the same boundary already
// observed for the 26 photo captions (see GWP_State_of_Record_2026-08-07.md §6 and
// captions-written-by-76ds.json). Replace these with Lynn's own words when she
// supplies them.
//
// `category` MUST match the API category string exactly — it is what
// /products?category=… filters on. Verified against
// GET https://api.greatwildlifephotos.com/products/categories/list on 2026-08-17.

export const COLLECTIONS = [
  {
    slug: 'bears',
    category: 'Bears',
    name: 'Bears',
    title: 'Bear Photography Prints — Black, Grizzly, Brown & Polar | Great Wildlife Photos',
    description:
      'Fine art bear photography prints by Lynn Starnes, covering the whole North American bear family — black, grizzly, coastal brown and polar bears photographed at the Arctic Circle.',
    author: 'lynn',
    intro:
      'I have a thorough portfolio of Black bear, grizzly bears, coastal brown bears and polar bears. That is all of North American bear family. My polar bear photos were taken in Canada. More specifically 2 weeks at the Arctic circle in winter weather that was never warmer than -27 degrees F and the lowest I went out in was -46 degrees below. I earned my polar images! Since it was so cold, the Hudson Bay was freezing over, ice flows were forming and polar bears were starting to hunt for seals – their first food in months. My Nikon camera was a champ that worked regardless of how cold! This polar bear image was judged in the top 25 images submitted out of almost 70,000 in 2018 for Nature’s Best/Smithsonian. Since I live in northern Nevada and close to the Sierra Mountains, it is relatively easy to spot black bears both in remote areas and in the outskirts of our cities.',
  },
  {
    slug: 'wild-horses',
    category: 'Wild Horses',
    name: 'Wild Horses',
    title: 'Wild Horse Photography Prints | Great Wildlife Photos',
    description:
      'Fine art wild horse photography prints by Lynn Starnes — bands running, jumping and rolling at a mountain lake, caught in early morning light.',
    author: 'lynn',
    intro:
      'I grew up with horses. I spent most of my day riding from the time I got my first horse at age 4 (didn’t learn to ride a bike until I was a teenager – no need on dirt roads!). Domestic horses spent most of their time eating. So do wild horses! The challenge as a photographer is to get that different photograph! These two title shots are of wild horses that have come to an area lake and they are running and jumping or just “playing.” After they settle down, they take turns rolling in the shallow water. The white horse is actually a grey but the morning light and mountain shadow behind make the stallion appear white and that adds depth and captures us viewers into a magical moment.',
  },
  {
    slug: 'elk',
    category: 'Elk',
    name: 'Elk',
    title: 'Elk Photography Prints — Bulls, Herds & the Rut | Great Wildlife Photos',
    description:
      'Fine art elk photography prints by Lynn Starnes — bull elk before and during the rut, herds moving to water, and ridgeline silhouettes in high desert light.',
    author: 'lynn',
    intro:
      'I have the most fun trying to get picturesque bull elk just before and during the rut. The challenge for me is finding or calling in a bull without one or more cows. The cows pay more attention to their surroundings! My best luck is capturing one animal or a herd heading out of brush/cover to a water hole. The most desirable photograph is when I catch them on a ridge or ridgeline. Then the wait begins to see if there is going to be something dramatic with clouds or a sunset or rarely a storm (I live in the high desert region).',
  },
  {
    slug: 'lake-tahoe',
    category: 'Lake Tahoe',
    name: 'Lake Tahoe',
    title: 'Lake Tahoe Photography Prints | Great Wildlife Photos',
    description:
      'Fine art Lake Tahoe photography prints by Lynn Starnes — the largest alpine lake in North America, photographed in storm light without the summer crowds.',
    author: 'lynn',
    intro:
      'Lake Tahoe is a freshwater lake in the Sierra Nevada Mountains. The lake straddles the Nevada/California border. At 6,225 ft elevation, it is the largest alpine lake in North America. Only the five Great Lakes are larger in volume. Lake Tahoe is stunning but due to its size, it is actually difficult to photograph. Since I prefer to photograph without people in the image, summer with its crowds make classic dramatic photographs difficult. I have started going out when storms are forecast. First of all, the storms and wind clear the wildfire smoke and large city smog out of the basin. And folks start heading to restaurants and bars to wait out the storms. Mostly I get rained out. Last year, I got lucky. Enjoy.',
  },
  {
    slug: 'mule-deer',
    category: 'Mule Deer',
    name: 'Mule Deer',
    title: 'Mule Deer Photography Prints | Great Wildlife Photos',
    description:
      'Fine art mule deer photography prints by Lynn Starnes — bucks and does in the western United States, photographed at dawn and dusk when the deer are active.',
    author: 'lynn',
    intro:
      'Mule deer are named for their large, mule-like ears and having a white rump patch with a black-tipped tail. In summer, they are tannish brown while in winter they turn brownish-grey. Mule deer prefer arid, open regions and rocky hillsides but are found in forests, grasslands, shrublands, and semi-deserts. They are found throughout the western United States. Since mule deer are most active at dawn or dusk, that is when I am out photographing. During the day they rest in secluded areas (I find them in ravines most frequently).',
  },
  {
    slug: 'bighorn-sheep',
    category: 'Bighorn Sheep',
    name: 'Bighorn Sheep',
    title: 'Bighorn Sheep Photography Prints | Great Wildlife Photos',
    description:
      'Fine art bighorn sheep photography prints by Lynn Starnes, a habitat restoration biologist — wild sheep photographed at distance, without pressuring the herd.',
    author: 'lynn',
    intro:
      'Since my working life involved habitat restoration, I am still involved in conservation organizations that are working to restore bighorn sheep in the west. In the late 1800s, bighorn sheep experienced catastrophic population declines. Expanding human settlements, agriculture, and infrastructure reduced and fragmented bighorn sheep habitat. Debilitating diseases, particularly pneumonia, were a major driver of mortality, especially in stressed or weakened herds. Restoration efforts began in earnest in the mid-20th century, with translocations and reintroductions aimed at re-establishing herds in historical habitats. Photographing wild sheep may be the most challenging photography as I try to get my photos without causing the sheep to flee because of my presence. I have great telephoto lenses!',
  },

  // ── Below: Lynn has not written copy for these three. Factual natural-history
  // description only, no first-person, no invented field stories. Replace with her
  // own words when she supplies them. Tracked in collections-written-by-76ds.json.
  {
    slug: 'hawks-and-owls',
    category: 'Hawks and Owls',
    name: 'Hawks and Owls',
    title: 'Hawk & Owl Photography Prints — Birds of Prey | Great Wildlife Photos',
    description:
      'Fine art hawk and owl photography prints by Lynn Starnes — North American birds of prey photographed perched, hunting and in flight.',
    author: '76ds',
    intro:
      'Hawks and owls are North America’s most widely encountered birds of prey, and they divide the day between them: hawks hunt on the wing in daylight, riding thermals and scanning open ground from a perch, while most owls work at dusk and after dark, relying on asymmetrically set ear openings to locate prey by sound alone. Both are built for the same task in different ways — the hawk for speed and eyesight, the owl for silence, with a soft leading edge on the flight feathers that breaks up the turbulence which would otherwise announce its approach. Photographing either means finding a bird that has chosen to tolerate you, and waiting: raptors spend far more time watching than they do flying.',
  },
  {
    slug: 'united-states-large-cats',
    category: 'United States Large Cats',
    name: 'United States Large Cats',
    title: 'Bobcat & Mountain Lion Photography Prints | Great Wildlife Photos',
    description:
      'Fine art photography prints of North America’s wild cats by Lynn Starnes — bobcats and mountain lions, photographed in snow and cover.',
    author: '76ds',
    intro:
      'The wild cats of the United States are solitary, largely crepuscular, and built to avoid being seen — which is why photographs of them are uncommon regardless of how numerous the animals are. The bobcat is the most widespread, adaptable enough to live within sight of towns and rarely noticed there, hunting rabbits and rodents through cover. The mountain lion ranges more widely than any other large mammal in the Americas and is seen even less often. Both cats hunt by stalking rather than pursuit, closing the distance in cover and relying on a short final rush, which is also the reason a photographer working at range and staying still will see far more than one moving through the same ground.',
  },
  {
    slug: 'wolves-coyotes-and-foxes',
    category: 'Wolves, Coyotes and Foxes',
    name: 'Wolves, Coyotes and Foxes',
    title: 'Wolf, Coyote & Fox Photography Prints | Great Wildlife Photos',
    description:
      'Fine art wild canid photography prints by Lynn Starnes — wolves, coyotes and foxes of North America, photographed hunting and on the move.',
    author: '76ds',
    intro:
      'North America’s wild canids span a wide range of size and habit while sharing the same essential toolkit: stamina, acute hearing and a nose that does most of the work. Wolves are the social extreme, living and hunting in family groups whose territory can cover hundreds of square miles. Coyotes are the adaptable middle, working alone or in pairs and thriving from open desert to city edge — the one wild canid most people in the west have actually heard. Foxes are the smallest and the most cat-like in method, hunting rodents by sound and finishing with the high, arcing pounce that lands them front-feet-first through snow or grass.',
  },
];

export const COLLECTION_BY_SLUG = Object.fromEntries(COLLECTIONS.map((c) => [c.slug, c]));
export const COLLECTION_BY_CATEGORY = Object.fromEntries(COLLECTIONS.map((c) => [c.category, c]));

export const collectionPath = (slug) => `/gallery/${slug}`;

export default COLLECTIONS;

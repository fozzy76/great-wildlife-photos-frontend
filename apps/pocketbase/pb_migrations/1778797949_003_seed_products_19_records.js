/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("title", "Morning Grizzly in Misty Forest");
    record0.set("slug", "morning-grizzly-misty-forest");
    const record0_collectionLookup = app.findFirstRecordByFilter("collections", "slug='black-bears'");
    if (!record0_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='black-bears'\""); }
    record0.set("collection", record0_collectionLookup.id);
    record0.set("description", "A powerful black bear emerges from the morning mist in an old-growth forest. The soft light highlights the bear's thick fur and muscular frame as it moves through the dense woodland.");
    record0.set("base_price", 79.99);
    record0.set("available_sizes", ["8x10", "11x14", "16x20"]);
    record0.set("print_types", ["Fine Art Paper", "Canvas"]);
    record0.set("featured", true);
    record0.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99}");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("title", "Black Bear Fishing at Waterfall");
    record1.set("slug", "black-bear-fishing-waterfall");
    const record1_collectionLookup = app.findFirstRecordByFilter("collections", "slug='black-bears'");
    if (!record1_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='black-bears'\""); }
    record1.set("collection", record1_collectionLookup.id);
    record1.set("description", "A black bear stands in rushing water, focused on catching salmon at a cascading waterfall. The dynamic composition captures the raw power and hunting prowess of these magnificent creatures.");
    record1.set("base_price", 89.99);
    record1.set("available_sizes", ["8x10", "11x14", "16x20", "20x30"]);
    record1.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record1.set("featured", true);
    record1.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '8x10_metal': 99.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '11x14_metal': 159.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '16x20_metal': 249.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '20x30_metal': 349.99}");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("title", "Mother Bear with Cubs in Wildflower Meadow");
    record2.set("slug", "mother-bear-cubs-wildflower");
    const record2_collectionLookup = app.findFirstRecordByFilter("collections", "slug='black-bears'");
    if (!record2_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='black-bears'\""); }
    record2.set("collection", record2_collectionLookup.id);
    record2.set("description", "A protective mother black bear watches over her playful cubs in a vibrant wildflower meadow. This intimate family moment showcases the nurturing side of these powerful animals.");
    record2.set("base_price", 99.99);
    record2.set("available_sizes", ["11x14", "16x20", "20x30", "24x36"]);
    record2.set("print_types", ["Fine Art Paper", "Canvas"]);
    record2.set("featured", false);
    record2.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '24x36_fine_art': 249.99, '24x36_canvas': 349.99}");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("title", "Black Bear Portrait in Golden Hour");
    record3.set("slug", "black-bear-portrait-golden-hour");
    const record3_collectionLookup = app.findFirstRecordByFilter("collections", "slug='black-bears'");
    if (!record3_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='black-bears'\""); }
    record3.set("collection", record3_collectionLookup.id);
    record3.set("description", "A striking close-up portrait of a black bear bathed in warm golden hour light. The detailed fur texture and intelligent eyes create an intimate connection with the viewer.");
    record3.set("base_price", 69.99);
    record3.set("available_sizes", ["8x10", "11x14", "16x20"]);
    record3.set("print_types", ["Fine Art Paper", "Canvas"]);
    record3.set("featured", false);
    record3.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99}");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("title", "Wild Horses Running Through Desert Dust");
    record4.set("slug", "wild-horses-running-desert-dust");
    const record4_collectionLookup = app.findFirstRecordByFilter("collections", "slug='wild-horses'");
    if (!record4_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='wild-horses'\""); }
    record4.set("collection", record4_collectionLookup.id);
    record4.set("description", "A dramatic herd of wild horses gallops across the desert, kicking up clouds of golden dust. The raw energy and freedom of these untamed animals is captured in stunning detail.");
    record4.set("base_price", 89.99);
    record4.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record4.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record4.set("featured", true);
    record4.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '11x14_metal': 159.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '16x20_metal': 249.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '20x30_metal': 349.99}");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("title", "Stallion Portrait Against Mountain Backdrop");
    record5.set("slug", "stallion-portrait-mountain-backdrop");
    const record5_collectionLookup = app.findFirstRecordByFilter("collections", "slug='wild-horses'");
    if (!record5_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='wild-horses'\""); }
    record5.set("collection", record5_collectionLookup.id);
    record5.set("description", "A majestic wild stallion stands proud against a dramatic mountain landscape. The powerful musculature and flowing mane are beautifully highlighted in this striking portrait.");
    record5.set("base_price", 79.99);
    record5.set("available_sizes", ["8x10", "11x14", "16x20", "20x30"]);
    record5.set("print_types", ["Fine Art Paper", "Canvas"]);
    record5.set("featured", false);
    record5.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("title", "Mare and Foal in Wildflower Field");
    record6.set("slug", "mare-foal-wildflower-field");
    const record6_collectionLookup = app.findFirstRecordByFilter("collections", "slug='wild-horses'");
    if (!record6_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='wild-horses'\""); }
    record6.set("collection", record6_collectionLookup.id);
    record6.set("description", "A tender moment between a wild mare and her young foal in a field of blooming wildflowers. This image captures the bond between mother and offspring in their natural habitat.");
    record6.set("base_price", 84.99);
    record6.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record6.set("print_types", ["Fine Art Paper", "Canvas"]);
    record6.set("featured", false);
    record6.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("title", "Herd Silhouette at Sunset");
    record7.set("slug", "herd-silhouette-sunset");
    const record7_collectionLookup = app.findFirstRecordByFilter("collections", "slug='wild-horses'");
    if (!record7_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='wild-horses'\""); }
    record7.set("collection", record7_collectionLookup.id);
    record7.set("description", "A silhouetted herd of wild horses stands against a vibrant sunset sky. The dramatic lighting creates a powerful and evocative image of freedom and wilderness.");
    record7.set("base_price", 74.99);
    record7.set("available_sizes", ["8x10", "11x14", "16x20"]);
    record7.set("print_types", ["Fine Art Paper", "Canvas"]);
    record7.set("featured", false);
    record7.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99}");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("title", "Mule Deer Buck in Autumn Forest");
    record8.set("slug", "mule-deer-buck-autumn-forest");
    const record8_collectionLookup = app.findFirstRecordByFilter("collections", "slug='mule-deer'");
    if (!record8_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='mule-deer'\""); }
    record8.set("collection", record8_collectionLookup.id);
    record8.set("description", "A graceful mule deer buck with impressive antlers stands alert in a golden autumn forest. The warm fall colors complement the deer's elegant posture and keen awareness.");
    record8.set("base_price", 74.99);
    record8.set("available_sizes", ["8x10", "11x14", "16x20"]);
    record8.set("print_types", ["Fine Art Paper", "Canvas"]);
    record8.set("featured", true);
    record8.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99}");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("title", "Doe and Fawn in Morning Light");
    record9.set("slug", "doe-fawn-morning-light");
    const record9_collectionLookup = app.findFirstRecordByFilter("collections", "slug='mule-deer'");
    if (!record9_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='mule-deer'\""); }
    record9.set("collection", record9_collectionLookup.id);
    record9.set("description", "A protective doe stands beside her young fawn in soft morning light filtering through the trees. This intimate family moment showcases the gentle nature of these beautiful creatures.");
    record9.set("base_price", 79.99);
    record9.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record9.set("print_types", ["Fine Art Paper", "Canvas"]);
    record9.set("featured", false);
    record9.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("title", "Mule Deer Herd in Snowy Meadow");
    record10.set("slug", "mule-deer-herd-snowy-meadow");
    const record10_collectionLookup = app.findFirstRecordByFilter("collections", "slug='mule-deer'");
    if (!record10_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='mule-deer'\""); }
    record10.set("collection", record10_collectionLookup.id);
    record10.set("description", "A peaceful herd of mule deer grazes in a pristine snowy meadow surrounded by evergreen trees. The winter landscape creates a serene and beautiful composition.");
    record10.set("base_price", 84.99);
    record10.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record10.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record10.set("featured", false);
    record10.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '11x14_metal': 159.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '16x20_metal': 249.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '20x30_metal': 349.99}");
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("title", "Buck Portrait with Velvet Antlers");
    record11.set("slug", "buck-portrait-velvet-antlers");
    const record11_collectionLookup = app.findFirstRecordByFilter("collections", "slug='mule-deer'");
    if (!record11_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='mule-deer'\""); }
    record11.set("collection", record11_collectionLookup.id);
    record11.set("description", "A detailed close-up portrait of a mule deer buck with velvet-covered antlers. The soft focus background emphasizes the deer's striking features and alert expression.");
    record11.set("base_price", 69.99);
    record11.set("available_sizes", ["8x10", "11x14", "16x20"]);
    record11.set("print_types", ["Fine Art Paper", "Canvas"]);
    record11.set("featured", false);
    record11.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99}");
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record12 = new Record(collection);
    record12.set("title", "Bighorn Sheep on Rocky Cliff");
    record12.set("slug", "bighorn-sheep-rocky-cliff");
    const record12_collectionLookup = app.findFirstRecordByFilter("collections", "slug='bighorn-sheep'");
    if (!record12_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='bighorn-sheep'\""); }
    record12.set("collection", record12_collectionLookup.id);
    record12.set("description", "An iconic bighorn sheep stands majestically on a steep rocky cliff, silhouetted against the sky. The dramatic mountain setting emphasizes the sheep's incredible climbing ability.");
    record12.set("base_price", 94.99);
    record12.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record12.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record12.set("featured", true);
    record12.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '11x14_metal': 159.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '16x20_metal': 249.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '20x30_metal': 349.99}");
  try {
    app.save(record12);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record13 = new Record(collection);
    record13.set("title", "Ram Portrait with Curved Horns");
    record13.set("slug", "ram-portrait-curved-horns");
    const record13_collectionLookup = app.findFirstRecordByFilter("collections", "slug='bighorn-sheep'");
    if (!record13_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='bighorn-sheep'\""); }
    record13.set("collection", record13_collectionLookup.id);
    record13.set("description", "A striking portrait of a bighorn ram with impressive curved horns. The detailed texture of the horns and wool is beautifully captured against a mountain backdrop.");
    record13.set("base_price", 84.99);
    record13.set("available_sizes", ["8x10", "11x14", "16x20", "20x30"]);
    record13.set("print_types", ["Fine Art Paper", "Canvas"]);
    record13.set("featured", false);
    record13.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record13);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record14 = new Record(collection);
    record14.set("title", "Herd Grazing in Alpine Meadow");
    record14.set("slug", "herd-grazing-alpine-meadow");
    const record14_collectionLookup = app.findFirstRecordByFilter("collections", "slug='bighorn-sheep'");
    if (!record14_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='bighorn-sheep'\""); }
    record14.set("collection", record14_collectionLookup.id);
    record14.set("description", "A peaceful herd of bighorn sheep grazes in a lush alpine meadow surrounded by towering peaks. The composition captures the harmony between these animals and their mountain home.");
    record14.set("base_price", 79.99);
    record14.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record14.set("print_types", ["Fine Art Paper", "Canvas"]);
    record14.set("featured", false);
    record14.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record14);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record15 = new Record(collection);
    record15.set("title", "Lake Tahoe Crystal Clear Waters");
    record15.set("slug", "lake-tahoe-crystal-clear-waters");
    const record15_collectionLookup = app.findFirstRecordByFilter("collections", "slug='lake-tahoe'");
    if (!record15_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='lake-tahoe'\""); }
    record15.set("collection", record15_collectionLookup.id);
    record15.set("description", "The pristine crystal-clear waters of Lake Tahoe reflect the surrounding mountains and sky. This stunning landscape captures the pure beauty and serenity of this alpine jewel.");
    record15.set("base_price", 89.99);
    record15.set("available_sizes", ["11x14", "16x20", "20x30", "24x36"]);
    record15.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record15.set("featured", true);
    record15.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '11x14_metal': 159.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '16x20_metal': 249.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '20x30_metal': 349.99, '24x36_fine_art': 249.99, '24x36_canvas': 349.99, '24x36_metal': 449.99}");
  try {
    app.save(record15);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record16 = new Record(collection);
    record16.set("title", "Tahoe Sunset Over Mountain Peaks");
    record16.set("slug", "tahoe-sunset-mountain-peaks");
    const record16_collectionLookup = app.findFirstRecordByFilter("collections", "slug='lake-tahoe'");
    if (!record16_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='lake-tahoe'\""); }
    record16.set("collection", record16_collectionLookup.id);
    record16.set("description", "A breathtaking sunset paints the sky in vibrant colors above Lake Tahoe's pristine waters. The surrounding mountain peaks are silhouetted against the golden and purple hues.");
    record16.set("base_price", 99.99);
    record16.set("available_sizes", ["11x14", "16x20", "20x30", "24x36"]);
    record16.set("print_types", ["Fine Art Paper", "Canvas"]);
    record16.set("featured", false);
    record16.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99, '24x36_fine_art': 249.99, '24x36_canvas': 349.99}");
  try {
    app.save(record16);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record17 = new Record(collection);
    record17.set("title", "Tahoe Winter Wonderland");
    record17.set("slug", "tahoe-winter-wonderland");
    const record17_collectionLookup = app.findFirstRecordByFilter("collections", "slug='lake-tahoe'");
    if (!record17_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='lake-tahoe'\""); }
    record17.set("collection", record17_collectionLookup.id);
    record17.set("description", "Lake Tahoe transforms into a winter wonderland with snow-covered peaks and frozen shores. The pristine white landscape contrasts beautifully with the deep blue waters.");
    record17.set("base_price", 84.99);
    record17.set("available_sizes", ["11x14", "16x20", "20x30"]);
    record17.set("print_types", ["Fine Art Paper", "Canvas"]);
    record17.set("featured", false);
    record17.set("price_variants", "{'11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record17);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record18 = new Record(collection);
    record18.set("title", "Tahoe Forest Reflection");
    record18.set("slug", "tahoe-forest-reflection");
    const record18_collectionLookup = app.findFirstRecordByFilter("collections", "slug='lake-tahoe'");
    if (!record18_collectionLookup) { throw new Error("Lookup failed for collection: no record in 'collections' matching \"slug='lake-tahoe'\""); }
    record18.set("collection", record18_collectionLookup.id);
    record18.set("description", "Dense evergreen forests are perfectly reflected in the mirror-like surface of Lake Tahoe. This serene composition showcases the untouched wilderness surrounding the lake.");
    record18.set("base_price", 79.99);
    record18.set("available_sizes", ["8x10", "11x14", "16x20", "20x30"]);
    record18.set("print_types", ["Fine Art Paper", "Canvas"]);
    record18.set("featured", false);
    record18.set("price_variants", "{'8x10_fine_art': 49.99, '8x10_canvas': 79.99, '11x14_fine_art': 89.99, '11x14_canvas': 129.99, '16x20_fine_art': 149.99, '16x20_canvas': 199.99, '20x30_fine_art': 199.99, '20x30_canvas': 279.99}");
  try {
    app.save(record18);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
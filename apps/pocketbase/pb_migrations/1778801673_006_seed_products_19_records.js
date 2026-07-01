/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("title", "Morning Grizzly in Misty Forest");
    record0.set("slug", "morning-grizzly-misty-forest");
    record0.set("description", "A majestic grizzly bear emerges from the morning mist in a dense forest setting, captured in golden hour light.");
    record0.set("image_id", "unsplash-bear-1");
    record0.set("merchoneImageId", "PROD-001");
    record0.set("base_price", 79.99);
    record0.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record0.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record0.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record0.set("featured", true);
    record0.set("isVisible", true);
    record0.set("displayOrder", 1);
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
    record1.set("title", "Bear at the Stream");
    record1.set("slug", "bear-stream");
    record1.set("description", "A powerful bear fishing in a pristine mountain stream, surrounded by rocky terrain and rushing water.");
    record1.set("image_id", "unsplash-bear-2");
    record1.set("merchoneImageId", "PROD-002");
    record1.set("base_price", 79.99);
    record1.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record1.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record1.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record1.set("featured", false);
    record1.set("isVisible", true);
    record1.set("displayOrder", 2);
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
    record2.set("title", "Solitary Bear in Meadow");
    record2.set("slug", "solitary-bear-meadow");
    record2.set("description", "A lone bear stands peacefully in a wildflower meadow with mountain peaks in the distance.");
    record2.set("image_id", "unsplash-bear-3");
    record2.set("merchoneImageId", "PROD-003");
    record2.set("base_price", 79.99);
    record2.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record2.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record2.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record2.set("featured", false);
    record2.set("isVisible", true);
    record2.set("displayOrder", 3);
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
    record3.set("title", "Bear Family Moment");
    record3.set("slug", "bear-family-moment");
    record3.set("description", "A touching moment captured as a mother bear and her cubs play together in their natural habitat.");
    record3.set("image_id", "unsplash-bear-4");
    record3.set("merchoneImageId", "PROD-004");
    record3.set("base_price", 79.99);
    record3.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record3.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record3.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record3.set("featured", true);
    record3.set("isVisible", true);
    record3.set("displayOrder", 4);
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
    record4.set("title", "Mustang Herd at Sunset");
    record4.set("slug", "mustang-herd-sunset");
    record4.set("description", "A dramatic herd of wild mustangs galloping across the desert landscape at golden hour.");
    record4.set("image_id", "unsplash-horse-1");
    record4.set("merchoneImageId", "PROD-005");
    record4.set("base_price", 79.99);
    record4.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record4.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record4.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record4.set("featured", true);
    record4.set("isVisible", true);
    record4.set("displayOrder", 5);
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
    record5.set("title", "Stallion Portrait");
    record5.set("slug", "stallion-portrait");
    record5.set("description", "A striking portrait of a powerful stallion with flowing mane, captured in natural light.");
    record5.set("image_id", "unsplash-horse-2");
    record5.set("merchoneImageId", "PROD-006");
    record5.set("base_price", 79.99);
    record5.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record5.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record5.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record5.set("featured", false);
    record5.set("isVisible", true);
    record5.set("displayOrder", 6);
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
    record6.set("title", "Horses in the Canyon");
    record6.set("slug", "horses-canyon");
    record6.set("description", "Wild horses navigate through a stunning red rock canyon, showcasing the beauty of untamed nature.");
    record6.set("image_id", "unsplash-horse-3");
    record6.set("merchoneImageId", "PROD-007");
    record6.set("base_price", 79.99);
    record6.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record6.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record6.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record6.set("featured", false);
    record6.set("isVisible", true);
    record6.set("displayOrder", 7);
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
    record7.set("title", "Desert Runners");
    record7.set("slug", "desert-runners");
    record7.set("description", "A group of wild horses running freely across the vast desert landscape under clear skies.");
    record7.set("image_id", "unsplash-horse-4");
    record7.set("merchoneImageId", "PROD-008");
    record7.set("base_price", 79.99);
    record7.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record7.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record7.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record7.set("featured", false);
    record7.set("isVisible", true);
    record7.set("displayOrder", 8);
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
    record8.set("title", "Buck in Autumn Light");
    record8.set("slug", "buck-autumn-light");
    record8.set("description", "A majestic mule deer buck stands alert in golden autumn light, with antlers catching the sun.");
    record8.set("image_id", "unsplash-deer-1");
    record8.set("merchoneImageId", "PROD-009");
    record8.set("base_price", 79.99);
    record8.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record8.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record8.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record8.set("featured", true);
    record8.set("isVisible", true);
    record8.set("displayOrder", 9);
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
    record9.set("title", "Doe and Fawn");
    record9.set("slug", "doe-fawn");
    record9.set("description", "A tender moment between a mother mule deer and her young fawn in a natural meadow setting.");
    record9.set("image_id", "unsplash-deer-2");
    record9.set("merchoneImageId", "PROD-010");
    record9.set("base_price", 79.99);
    record9.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record9.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record9.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record9.set("featured", false);
    record9.set("isVisible", true);
    record9.set("displayOrder", 10);
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
    record10.set("title", "Deer in Winter Snow");
    record10.set("slug", "deer-winter-snow");
    record10.set("description", "Mule deer navigate through a snowy landscape, their dark coats contrasting beautifully with white snow.");
    record10.set("image_id", "unsplash-deer-3");
    record10.set("merchoneImageId", "PROD-011");
    record10.set("base_price", 79.99);
    record10.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record10.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record10.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record10.set("featured", false);
    record10.set("isVisible", true);
    record10.set("displayOrder", 11);
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
    record11.set("title", "Alert Mule Deer");
    record11.set("slug", "alert-mule-deer");
    record11.set("description", "A vigilant mule deer with characteristic large ears alert and listening, captured in sharp detail.");
    record11.set("image_id", "unsplash-deer-4");
    record11.set("merchoneImageId", "PROD-012");
    record11.set("base_price", 79.99);
    record11.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record11.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record11.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record11.set("featured", false);
    record11.set("isVisible", true);
    record11.set("displayOrder", 12);
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
    record12.set("title", "Mountain King");
    record12.set("slug", "mountain-king");
    record12.set("description", "A magnificent bighorn sheep ram stands proudly on a rocky mountain peak, surveying his domain.");
    record12.set("image_id", "unsplash-sheep-1");
    record12.set("merchoneImageId", "PROD-013");
    record12.set("base_price", 79.99);
    record12.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record12.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record12.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record12.set("featured", true);
    record12.set("isVisible", true);
    record12.set("displayOrder", 13);
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
    record13.set("title", "Sheep on the Ridge");
    record13.set("slug", "sheep-ridge");
    record13.set("description", "Bighorn sheep navigate along a dramatic mountain ridge with stunning alpine scenery.");
    record13.set("image_id", "unsplash-sheep-2");
    record13.set("merchoneImageId", "PROD-014");
    record13.set("base_price", 79.99);
    record13.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record13.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record13.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record13.set("featured", false);
    record13.set("isVisible", true);
    record13.set("displayOrder", 14);
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
    record14.set("title", "Bighorn Family");
    record14.set("slug", "bighorn-family");
    record14.set("description", "A family group of bighorn sheep together on rocky terrain, showcasing their natural habitat.");
    record14.set("image_id", "unsplash-sheep-3");
    record14.set("merchoneImageId", "PROD-015");
    record14.set("base_price", 79.99);
    record14.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record14.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record14.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record14.set("featured", false);
    record14.set("isVisible", true);
    record14.set("displayOrder", 15);
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
    record15.set("title", "Cliff Dweller");
    record15.set("slug", "cliff-dweller");
    record15.set("description", "A bighorn sheep perched on a steep cliff face, demonstrating their incredible climbing abilities.");
    record15.set("image_id", "unsplash-sheep-4");
    record15.set("merchoneImageId", "PROD-016");
    record15.set("base_price", 79.99);
    record15.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record15.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record15.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record15.set("featured", false);
    record15.set("isVisible", true);
    record15.set("displayOrder", 16);
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
    record16.set("title", "Alpine Lake Reflection");
    record16.set("slug", "alpine-lake-reflection");
    record16.set("description", "A pristine alpine lake reflects towering mountain peaks and clear blue sky in perfect mirror image.");
    record16.set("image_id", "unsplash-tahoe-1");
    record16.set("merchoneImageId", "PROD-017");
    record16.set("base_price", 79.99);
    record16.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record16.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record16.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record16.set("featured", true);
    record16.set("isVisible", true);
    record16.set("displayOrder", 17);
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
    record17.set("title", "Sierra Sunrise");
    record17.set("slug", "sierra-sunrise");
    record17.set("description", "A breathtaking sunrise over the Sierra Nevada mountains with golden light illuminating the peaks.");
    record17.set("image_id", "unsplash-tahoe-2");
    record17.set("merchoneImageId", "PROD-018");
    record17.set("base_price", 79.99);
    record17.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record17.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record17.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record17.set("featured", false);
    record17.set("isVisible", true);
    record17.set("displayOrder", 18);
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
    record18.set("title", "Crystal Waters");
    record18.set("slug", "crystal-waters");
    record18.set("description", "Crystal clear waters of Lake Tahoe showcase the stunning turquoise color and pristine natural beauty.");
    record18.set("image_id", "unsplash-tahoe-3");
    record18.set("merchoneImageId", "PROD-019");
    record18.set("base_price", 79.99);
    record18.set("pricing", "{'8x10': {'fineArtPaper': 79.99, 'canvas': 109.99, 'metalPrint': 129.99}, '11x14': {'fineArtPaper': 119.99, 'canvas': 159.99, 'metalPrint': 189.99}, '16x20': {'fineArtPaper': 179.99, 'canvas': 239.99, 'metalPrint': 279.99}, '20x30': {'fineArtPaper': 249.99, 'canvas': 329.99, 'metalPrint': 389.99}, '24x36': {'fineArtPaper': 349.99, 'canvas': 459.99, 'metalPrint': 539.99}}");
    record18.set("available_sizes", ["8x10", "11x14", "16x20", "20x30", "24x36"]);
    record18.set("print_types", ["Fine Art Paper", "Canvas", "Metal Print"]);
    record18.set("featured", false);
    record18.set("isVisible", true);
    record18.set("displayOrder", 19);
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
/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("collections");

  const record0 = new Record(collection);
    record0.set("name", "Black Bears");
    record0.set("slug", "black-bears");
    record0.set("description", "Stunning wildlife photography of black bears in their natural habitat. From peaceful forest moments to powerful hunting scenes, these images capture the majesty and raw beauty of these magnificent creatures.");
    record0.set("heroImage", "https://images.unsplash.com/photo-1540573133985-87b6da476e1a?w=1200&h=600&fit=crop");
    record0.set("isVisible", true);
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
    record1.set("name", "Wild Horses");
    record1.set("slug", "wild-horses");
    record1.set("description", "Breathtaking images of wild mustangs running free across the American landscape. These powerful animals embody freedom and untamed nature, captured in stunning desert and canyon settings.");
    record1.set("heroImage", "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&h=600&fit=crop");
    record1.set("isVisible", true);
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
    record2.set("name", "Mule Deer");
    record2.set("slug", "mule-deer");
    record2.set("description", "Graceful mule deer captured in their natural environments, from autumn meadows to snowy landscapes. These elegant animals showcase the delicate beauty of North American wildlife.");
    record2.set("heroImage", "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=1200&h=600&fit=crop");
    record2.set("isVisible", true);
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
    record3.set("name", "Bighorn Sheep");
    record3.set("slug", "bighorn-sheep");
    record3.set("description", "Majestic bighorn sheep navigating the dramatic peaks and ridges of high mountain terrain. These incredible climbers demonstrate remarkable agility on some of the most challenging landscapes on Earth.");
    record3.set("heroImage", "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=600&fit=crop");
    record3.set("isVisible", true);
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
    record4.set("name", "Lake Tahoe");
    record4.set("slug", "lake-tahoe");
    record4.set("description", "Pristine alpine landscapes of Lake Tahoe and the Sierra Nevada mountains. Crystal clear waters, dramatic peaks, and golden sunrises create some of nature's most spectacular scenery.");
    record4.set("heroImage", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop");
    record4.set("isVisible", true);
  try {
    app.save(record4);
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
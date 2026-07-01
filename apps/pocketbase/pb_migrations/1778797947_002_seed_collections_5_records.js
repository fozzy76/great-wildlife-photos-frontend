/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("collections");

  const record0 = new Record(collection);
    record0.set("name", "Black Bears");
    record0.set("slug", "black-bears");
    record0.set("description", "Majestic black bears in their natural habitat");
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
    record1.set("description", "Free-roaming wild horses of the American West");
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
    record2.set("description", "Graceful mule deer in stunning landscapes");
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
    record3.set("description", "Iconic bighorn sheep of the mountains");
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
    record4.set("description", "Pristine alpine lake and surrounding wilderness");
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
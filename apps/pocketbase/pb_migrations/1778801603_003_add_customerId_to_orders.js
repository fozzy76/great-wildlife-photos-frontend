/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const customersCollection = app.findCollectionByNameOrId("customers");
  const collection = app.findCollectionByNameOrId("orders");

  const existing = collection.fields.getByName("customerId");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("customerId"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "customerId",
    required: false,
    collectionId: customersCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("orders");
    collection.fields.removeByName("customerId");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
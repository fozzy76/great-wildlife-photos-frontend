/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("collections");
  collection.indexes.push("CREATE UNIQUE INDEX idx_collections_slug ON collections (slug)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("collections");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_collections_slug"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
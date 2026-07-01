/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.listRule = "isVisible = true || @request.auth.collectionName = 'admins'";
  collection.viewRule = "isVisible = true || @request.auth.collectionName = 'admins'";
  collection.createRule = "@request.auth.collectionName = 'admins'";
  collection.updateRule = "@request.auth.collectionName = 'admins'";
  collection.deleteRule = "@request.auth.collectionName = 'admins'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("products");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = null;
  collection.updateRule = null;
  collection.deleteRule = null;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
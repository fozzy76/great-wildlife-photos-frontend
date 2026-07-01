/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("orders");
  collection.listRule = "@request.auth.collectionName = 'admins' || customerId = @request.auth.id";
  collection.viewRule = "@request.auth.collectionName = 'admins' || customerId = @request.auth.id";
  collection.createRule = "@request.auth.id != ''";
  collection.updateRule = "@request.auth.collectionName = 'admins'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("orders");
  collection.listRule = "customer_id = @request.auth.id || @request.auth.role = 'admin'";
  collection.viewRule = "customer_id = @request.auth.id || @request.auth.role = 'admin'";
  collection.createRule = "@request.auth.id != ''";
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
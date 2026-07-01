/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("orders");
  collection.indexes.push("CREATE UNIQUE INDEX idx_orders_order_number ON orders (order_number)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("orders");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_orders_order_number"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
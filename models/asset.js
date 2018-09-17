'use strict';

const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema ({
  type: { type: String, required: true },  //does not change
  model: { type: String, required: true }, //does not change
  version: String,  //does not change
  owner: { type: String, default: 'Inventory' }, 
  //null = not in inventory at all (2 possible status codes), 
  //inventory = inventory owns it and status is available, 
  //changes to 
  //requester badgeId when status is pending (requestId applied) & checked out(upon scanning), 
  //changes back to 
  //inventory when checked back in (upon scanning).
  status: { type: String, required: true }, 
  //not in inventory = always has owner = null; placeholder from past and for possible future as this asset is not in inventory and there are no current plans to order it for inventory
  //ordered for inventory = always has owner = null, a requestId that matches the orderId, and an expected date that matches the expected date of delivery; it has been ordered and is on its way into inventory
  //available = always has owner of inventory, asset is available to be checked out
  //pending = always has owner equal to the badgeId of the person who requested it, and a requestId that matches the request it is fulfilling; this asset is currently reserved for the requester with matching badgeID, and is awaiting pick up.  Changing status to pending would trigger an auto-notification to requester tht asset is ready to be picked up
  //checked out = always has owner equal to the badgeId of the person who checked it out, a requestId that matches the request it is fulfilling, and an expected date that matches the end date on the request form.
  requestId: String //matches requestID fulfilled by this asset, or the orderID of order placed to bring this asset into inventory; will be empty when status is not in inventory or available
});

assetSchema.set('timestamps', true);

assetSchema.set('toObject', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.createdAt;
    delete result.updatedAt;
  }
});

module.exports = mongoose.model('Asset', assetSchema);
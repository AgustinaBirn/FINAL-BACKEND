import mongoose from "mongoose";
import usersModel from "./user.model.js";
import productsModel from "./products.model.js"

mongoose.pluralize(null);

const collection = "carts";

const schema = new mongoose.Schema({
  user_id: {type: mongoose.Schema.Types.ObjectId,  ref: "users"},
  products: { type: [{_id: mongoose.Schema.Types.ObjectId, quantity: Number}], required: true, index: true, ref: "products"}
});

schema.pre("find", function () {
  // this.populate({path: "_user_id", model: usersModel});
  this.populate({path: "products._id", model: productsModel});
});

schema.pre("findOne", function () {
  // this.populate({path: "_user_id", model: usersModel});
  this.populate({path: "products._id", model: productsModel})
});

// schema.pre("find", function () {
//   this.populate({path: "_users_id", model: usersModel})
// });

const model = mongoose.model(collection, schema);

export default model;
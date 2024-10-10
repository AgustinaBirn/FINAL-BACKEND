import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

mongoose.pluralize(null);

const collection = "products";

const schema = new mongoose.Schema({
  title: { type: String, required: true, index: true },

  description: { type: String, required: false },

  price: { type: Number, required: true, index: true },

  thumbnail: { type: String, required: false },

  stock: { type: Number, required: true },

  state: { type: Boolean,  },

  category: { type: String, index: true },

  // category: { type: String, enum: ["custom", "special", "standard"], default: "standard", required: true, index: true },

  code: { type: String, required: true, unique: true},

  owner: { type: String, default: "admin" }
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;

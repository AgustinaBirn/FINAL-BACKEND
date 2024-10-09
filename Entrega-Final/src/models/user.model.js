import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = "users";

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number,  },
    role: { type: String, enum: ["admin", "premium", "user"], default: "user" },
    cart_id: {type: mongoose.Schema.Types.ObjectId, ref: "carts", },
    // documents: { type: [{name: String, reference: String}], required: true, default: [name= "", documents= null ]},
    documents: { type: [{name: {type : String}, reference: {type: String}}]},
    last_connection: {type: String}
});


const model = mongoose.model(collection, schema);

export default model;
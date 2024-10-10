import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = "tickets";

const schema = new mongoose.Schema({
    // _user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "users_index"},
    code: { type: String, unique: true, required: true },
    amount: { type: Number, required: true, default: 0.0 },
    purchase_datetime: { type: Date, default: Date.now },
    purchaser_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    purchaser: {type: String, required: true, ref: "users"},
},
{
    timestamps: true
});

schema.pre("save", async function (next) {
    try {
        const user = await userModel.findById(this.purchaser_id);
        if (user) {
            this.purchaser = user.email;
        } else {
            throw new Error("Usuario no encontrado");
        }
        next();
    } catch (error) {
        next(error);
    }
});

const model = mongoose.model(collection, schema);

export default model;
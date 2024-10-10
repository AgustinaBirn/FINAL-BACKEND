import mongoose from "mongoose";
import config from "../config.js";

export default class MongoSingleton {
    static #instance;

    constructor() {
        this.connect();
    }

    async connect() {
        await mongoose.connect(config.MONGODB_URI);
    }

    static getInstance() {
        if(!this.#instance) {
            this.#instance = new MongoSingleton();
            console.log("Conexión a bbdd creada");
        } else {
            console.log("Conexión bbdd recuperada");
        }

        return this.#instance;
    }
}
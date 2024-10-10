import Assert from "assert";
import mongoose from "mongoose";
import { ProductsManager } from "../src/controllers/products.manager.js";
import config from "../src/config.js";

const connection = await mongoose.connect(`mongodb+srv://agusbirn:1234@cluster0.zcj0mx1.mongodb.net/ecommerce`);
const manager = new ProductsManager();
const assert = Assert.strict;
const testProduct = {title: "Pantalón prueba",

description: "testeo de pantalon",

price: 13500,

stock: 3,

state: true,

category: "pantalones",

code: 156731,

owner: "premium"};

describe("Test ProductManager", function () {
    before(function () {});
    beforeEach(function () {});
    after(function () {});
    afterEach(function () {});

    it("getProducts() debe retornar un array de productos", async function () {
        const result = await manager.getProducts();

        assert.deepStrictEqual(result.docs, [] );
    });

    
    it("addProduct() debe crear un producto nuevo", async function () {
        const result = await manager.addProduct(testProduct);
        testProduct._id = result._id;

        assert.strictEqual(typeof(result), "object");
        assert.ok(result._id);
    });
    
    it("getProductById() debe retornar un producto determinado según su ID", async function () {
        const result = await manager.getProductById(testProduct._id);

        assert.strictEqual(typeof(result), "object");
        assert.ok(result._id);
    });

    it("updateProduct() debe actualizar las características definidas de un producto", async function () {
        const newPrice = 10700;
        const result = await manager.updateProduct({title: testProduct.title}, {price: newPrice}, {new: true});
        console.log(result);

        assert.strictEqual(typeof(result), "object");
        assert.ok(result._id);
        assert.deepStrictEqual(result.price, newPrice);
    });

    it("deleteProduct() debe eliminar un producto determinado según el ID", async function () {
        const result = await manager.deleteProduct(testProduct._id);

        assert.strictEqual(typeof(result), "object");
        assert.deepStrictEqual(result._id, testProduct._id);
    });

})
import { Router } from "express";
import { faker } from "@faker-js/faker";
import config from "../config.js";

const router = Router();

const generateFakeProducts = async (qty) => {
    const products = [];
    for(let i = 0; i < qty; i++ ){
        const title = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const price = faker.commerce.price({min: 1000, max:20000, dec:0});
        const category = faker.commerce.department();
        const stock = faker.number.int({ min: 10, max: 100 });
        const code = faker.commerce.isbn({ variant: 10, separator: ' ' });

        products.push({title,description, price, category, stock, code})
    }
    return products;
}

router.get("/", async (req, res) => {
  try{
    const fakeProducts = await generateFakeProducts(100);

    res.status(200).send({ origin: config.SERVER, payload: fakeProducts });
  } catch(err){
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
})

export default router;

import fs from "fs";
import { ProductsService } from "../src/services/products.dao.mdb";
import { error } from "console";

const route = "./carts.json";

const manager = new ProductsService();

export class CartManager {
  constructor() {
    this.carts = [];
    this.cartIdCounter = this.carts.length++;
  }

  async getCarts(limit) {
    try {
      const data = await fs.promises.readFile(route, "utf-8");
      const dataJson = JSON.parse(data);
      this.carts = dataJson;
      console.log("se lee el array");
      // return this.products;
      return limit === 0 ? this.carts : this.carts.slice(0, limit);
    } catch (err) {
      console.log("No se pudo leer el archivo", err);
      return [];
    }
  }

  async getCartById(id) {
    try {
      const data = await fs.promises.readFile(route, "utf-8");
      const dataJson = JSON.parse(data);
      this.carts = dataJson;
      const cart = this.carts.find((cart) => cart.id === +id);
      return cart;
    } catch (err) {
      console.log("No se encontró el carrito", err);
      return [];
    }
  }

  async addCart() {
    const getCarts = await this.getCarts(0);

    this.carts.cart = {
      products: [],
      id: this.carts.length + 1,
    };

    this.carts.push(this.carts.cart);
    const data = JSON.stringify(this.carts);
    try {
      await fs.promises.writeFile(route, data);
      console.log("se agrega al carrito funcion");
    } catch (err) {
      console.log("no se pudo agregar el carrito funcion", err);
    }
  }

  async addProductsToCart(cartId, productId, productToAdd) {
    const cart = await this.getCartById(cartId);
    const product = await manager.getProductById(productId);

    const quantity = JSON.stringify();
    try {
      let productAdded = cart.products.find(
        (item) => item.product === product.id
      );
      if (productAdded.quantity) {
        console.log("es el mismo id");
        console.log(cart.products[0].quantity + 1, error);
        productAdded.quantity += 1;
      } else {
        cart.products.push({ product: product.id, quantity: 1 });
        console.log(cart.products);
      }

      const data = JSON.stringify(this.carts);
      await fs.promises.writeFile(route, data);
      console.log(`se agregó el producto con id:${product.id} al carrito`);
    } catch (err) {
      console.log("no se pudo agregar el producto al carrito", err);
    }
  }
}

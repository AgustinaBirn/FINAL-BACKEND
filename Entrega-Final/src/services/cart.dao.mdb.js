import cartsModel from "../models/carts.model.js";
import usersModel from "../models/user.model.js";
import productsModel from "../models/products.model.js"
import { ProductsService } from "./products.dao.mdb.js";

const manager = new ProductsService();

export class CartsService {
  constructor() {
    this.carts = [cartsModel];
  }

  async getCarts(limit) {

    try {

        let data = await cartsModel.find().lean();
        return data
        // limit === 0 ? this.carts : this.carts.slice(0, limit);
        } 
        
        catch (err) {
          return {error: err.message};
        }
  }

  async getCartById(id) {

    try {
        const cartId = { _id : id};
        const cartsDb = await cartsModel.findOne(cartId).populate({path: "products._id", model: productsModel}).lean();

          return cartsDb;

        } catch (err) {
          console.log("No se encontró el carrito", err);
          return [];
        }
  }

  async addCart(cart) {

    try {
        const newCart = await cartsModel.create(cart);
        return newCart;
    } catch (err) {
        console.log("no se pudo crear el carrito", err);
    }
  }

  async addProductsToCart(cid, pid, userId) {
    const productId = { _id : pid};
    const cartId = { _id : cid};

    const cart = await this.getCartById(cartId);

    try {
      
      const product = await manager.getProductById(productId);

      if(product.owner === "ADMIN" || product.owner === userId || product.owner === "USER" || !product.owner){
        const productInCart = cart.products.find(p => p && p._id && p._id.toString() === pid) ? "yes" : "no";
        let body;
        const options = {new: true};;
  
        if (productInCart === "yes") {
            body = { $set: { "products.$.quantity": productInCart.quantity + 1 } };
            const filter = { _id: cid, "products._id": pid };
            
            const updatedCart = await cartsModel.findOneAndUpdate(filter, body, options);
            if (updatedCart) {
              console.log("Producto actualizado en el carrito");
            }
          } else {
            body = { $push: { products: { _id: pid, quantity: 1 } } };
            
            const updatedCart = await cartsModel.findOneAndUpdate(cartId, body, options);
            if (updatedCart) {
                console.log("Producto añadido al carrito");
            }
        }  
      } else{
        console.log("Al ser usuario premium, no puedes agregar productos que no te pertenecen al carrito");
      }

    } catch (err) {
      console.log("no se pudo agregar el producto al carrito", err);
    }
  }

  async removeProductToCart(cid, pid) {

      const cartId = { _id: cid };

        try {
            const body = { $pull: { products: { _id: pid } } };
            const options = { new: true };

            const updatedCart = await cartsModel.findOneAndUpdate(cartId, body, options);

            if (updatedCart) {
                console.log("Producto eliminado del carrito");
            } else {
                console.log("Carrito no encontrado o producto no presente");
            }
        } catch (err) {
            console.log("No se pudo eliminar el producto del carrito", err);
        }
  }

  async removeAllProductsFromCart(cid) {
    const cartId = { _id: cid };

    try {
        const updateBody = { $set: { products: [] } };
        const options = { new: true };

        const updatedCart = await cartsModel.findOneAndUpdate(cartId, updateBody, options) ? console.log("Todos los productos han sido eliminados del carrito") : console.log("Carrito no encontrado");

    } catch (err) {
        console.log("No se pudieron eliminar los productos del carrito", err);
    }
}

async updateProducts(cid, pid, quantity) {
  const cartId = { _id : cid};
  
  const cart = await this.getCartById(cartId);

  try {

    const body = { $set: { "products.$.quantity": cart.products[0].quantity + quantity } };
    const options = {new: true};;
    const filter = { _id: cid, "products._id": pid };
    
    const productInCart = cart.products.find(p => p._id.toString() === pid) ? await cartsModel.findOneAndUpdate(filter, body, options) 
    : console.log("No se encontró el producto");

    console.log(cart.products[0].quantity);
  } catch (err) {
    console.log("no se pudo modificar el producto del carrito", err);
  }
}
}
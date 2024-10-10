import productsModel from "../models/products.model.js";

export class ProductsService {
  constructor() {
  }

  async getProducts(limit, page, query, sort) {

    try {
     
      let filter = {};
      if (query) {
        filter.category = query;
      }
      
      const options = {
        page: page,
        limit: limit,
        sort: sort
      };
      
      const products = await productsModel.paginate({}, {filter, options, lean: true});
      
      return products
  } catch (err) {
      return err.message;
  };
  };

  async getProductById(id) {
    try {
    
    const productId = { _id : id};

    const productsDb = await productsModel.findOne(productId);

    return productsDb;

    } catch (err) {
      console.log("No se encontró el producto", err);
      return [];
    }
  }
  
  async addProduct(product) {
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.code ||
      !product.category ||
      !product.stock ) {
      console.log("Todos los campos son obligatorios.");
      }

      product.thumbnail ;
        
      try {
          const newProduct = await productsModel.findOne({code: product.code}) ? console.log("El código de producto ya existe.") : await productsModel.create(product);
          return newProduct;
      } catch (err) {
        console.log("no se pudo agregar el producto", err);
      }
    }

  async updateProduct(filter, body, options) {
            
    try {
        const productsDb = await productsModel.findOneAndUpdate( filter, body, options );
        console.log("Se actualizo el producto correctamente");
        return productsDb;
      } catch (err) {
        console.error("Error al actualizar el producto", err);
      }
  }

  async deleteProduct(id) {

      try {
        const process = await productsModel.findOneAndDelete(id);
        console.log("Se elimino correctamente el producto");
        return process;
      } catch (err) {
        console.error("Error al eliminar el producto", err);
      }
  }
}
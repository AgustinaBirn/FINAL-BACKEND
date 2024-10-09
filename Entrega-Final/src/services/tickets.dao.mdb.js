import ticketsModel from "../models/tickets.model.js";
import { CartsManager } from "../controllers/cart.manager.js";
import { ProductsManager } from "../controllers/products.manager.js";

export class TicketsService {
  constructor() {
  }

  async getTickets(limit, page, query, sort) {

    try {
     
      let filter = {};
      if (query) {
        filter.category = query;
      }
      
      const options = {
        page: page,
        limit: limit,
        sort: { price: sort }
      };
      
      const tickets = await ticketsModel.paginate({}, {filter, options, lean: true});
      
      return tickets
  } catch (err) {
      return err.message;
  };
  };

  async getTicketById(id) {
    try {
    
    const ticketId = { _id : id};

    const ticketsDb = await ticketsModel.findOne(ticketId);

    return ticketsDb;

    } catch (err) {
      console.log("No se encontró el ticket", err);
      return [];
    }
  }
  
  async addTicket(cid, ticket) {      
      try {
        //   const ticketDb = await ticketsModel.findOne({code: ticket.code})? console.log("Ya existe un ticket con ese código") : undefined;
        //   if(!ticketDb) {
              const cartManager = new CartsManager();
              const productManager = new ProductsManager();
              
            const cartId = req.user.cart_id || cid;
            const cartDb = await cartManager.getCartById(cartId);
            const productsCart = cartDb.products;

            productsCart.forEach(async product => {
                const productDb = await productManager.getProductById(product._id);
                const quantity = +product.quantity;
                const stock = +productDb.stock;

                if(quantity <= stock){
                    const result = stock - quantity;
                    productDb.stock = stock - quantity;

                    const body = { $set: { "stock": result} };
                    const options = {new: true};;
                    const filter = { _id: product._id };  

                    const updateProduct = await productManager.updateProduct(filter, body, options);
                    
                    
                    // const updateCart = await cartManager.updateProducts(cartId,product._id, result );
                    if(result === 0){
                        const deleteProduct = await cartManager.deleteProduct(product._id)
                    }
                // } else {
                //     const { productDb, ...filteredSavedProducts } = cartDb;
                //     cartDb = filteredSavedProducts;
                // }
                }
            });
            const newTicket = await ticketsModel.create(ticket);
        //   const newTicket = await ticketsModel.findOne({code: ticket.code}) ? console.log("El código de ticket ya existe.") : await ticketsModel.create(ticket);

      } catch (err) {
        console.log("no se pudo agregar el producto", err);
      }
    }

  async updateTicket(filter, body, options) {
            
    try {
        const ticketDb = await ticketsModel.findOneAndUpdate( filter, body, options );
        console.log("Se actualizo el ticket correctamente");
      } catch (err) {
        console.error("Error al actualizar el producto", err);
      }
  }

  async deleteTicket(id) {

      try {
        const process = await ticketsModel.findOneAndDelete(id);
        console.log("Se elimino correctamente el ticket");
      } catch (err) {
        console.error("Error al eliminar el ticket", err);
      }
  }
}
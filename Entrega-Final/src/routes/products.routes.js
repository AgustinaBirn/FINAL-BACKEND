import { Router } from "express";
import compression from "express-compression";
import { uploader } from "../services/uploader.js";
import productsModel from "../models/products.model.js";
import {ProductsManager} from '../controllers/products.manager.js';
import { verifyToken, handlePolicies, verifyMongoDBId} from "../services/utils.js";
import config from "../config.js";

const router = Router();

const manager = new ProductsManager();

router.param("id", verifyMongoDBId);

router.get("/longstring", compression({brotli: {enabled: true, zlib: {}}}), async (req, res) => {
  try{
    const base= "Prueba modulo compression coder";
    let string = "";
    for(let i = 0; i<10e4; i++) string += base;

    res.status(200).send({ origin: config.SERVER, payload: string });
  } catch(err){
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
})

router.get("/", async (req, res) => {
  try{
    const limit = +req.query.limit || 10;
    const page = +req.query.page || 1;
    const query = req.query.query;
    const sort = +req.query.sort || 1;
  
    const products = await manager.getProducts(limit, page, query, sort);
    // res.render("products", { 
    //   status: "success",
    //   payload: products.docs,
    //   totalDocs: products.totalDocs,
    //   limit: products.limit,
    //   page: products.page,
    //   totalPages: products.totalPages,
    //   hasNextPage: products.hasNextPage,
    //   hasPrevPage: products.hasPrevPage,
    //   nextPage: products.nextPage,
    //   prevPage: products.prevPage,
    //   prevLink: products.prevLink,
    //   nextLink: products.nextLink
    // });
    
    res.status(200).send({ origin: config.SERVER, payload: products });

  } catch(err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = await manager.getProductById(pid);
  
    res.status(200).send({ origin: config.SERVER, payload: productId });

  } catch(err){
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
});

router.post("/", verifyToken, handlePolicies(["ADMIN", "PREMIUM"]), uploader.single("thumbnail"), async (req, res) => {
  try {
    const body = req.body;
    const socketServer = req.app.get("socketServer");
    const thumbnail = req.file;
    body.thumbnail = thumbnail.originalname;
    
  
    const newProduct = await manager.addProduct(body);
    // req.logger.warning( `${new Date().toDateString()} ${req.method} ${req.url}`);
    
    // newProduct.owner = req.user._id

    updateProduct = await manager.updateProduct(newProduct._id, {owner: req.user._id})

    res.status(200).send({
      origin: config.SERVER,
      payload: body, 
    });
  
    socketServer.emit("newProduct", body);

  } catch (err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
  
});

router.put("/:id", verifyToken, handlePolicies(["ADMIN"]), async (req, res) => {
  try {
    const filter = { _id : req.params.id};
    const body = req.body;
    const options = {new: true};
  
    const productsDb = await manager.updateProduct( filter, body, options );
  
    res.status(200).send({
      origin: config.SERVER,
      payload: body,
    });
  } catch (err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
});

router.delete("/:id", verifyToken, handlePolicies(["ADMIN", "PREMIUM"]), async (req, res) => {
  try {
    const socketServer = req.app.get("socketServer");
    const id = { _id : req.params.id};

    const product = await manager.getProductById(id);

    if(req.user.role === "ADMIN"){
      const process = await manager.deleteProduct(id);
      socketServer.emit("productDeleted", process);
    } else if(req.user._id === product.owner){
        const process = await manager.deleteProduct(id);
        socketServer.emit("productDeleted", process);
      }else{
        return res.json({ message: 'No puedes eliminar el producto porque no lo has creado tu.' });
      }
      
  
    res
        .status(200)
        .json({ message: `Se elimino el producto con id: ${id}` });
      
  } catch (err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
});

router.all("*", async (req, res) => {
  res.status(404).send({ origin: config.SERVER, payload: null, error: "No se encuentra la ruta solicitada."});
})

export default router;

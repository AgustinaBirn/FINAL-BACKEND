import { Router } from "express";

import messagesModel from "../models/messages.model.js";
import productsModel from "../models/products.model.js";
import { ProductsManager } from "../controllers/products.manager.js";
import { CartsManager } from "../controllers/cart.manager.js";
import { verifyToken, handlePolicies} from "../services/utils.js";



const router = Router();
const productManager = new ProductsManager();
const cartManager = new CartsManager();

router.get("/register", (req, res) => {
  res.render("register", {})
});

router.get("/login", (req, res) => {
  if(req.session.user) return res.redirect("/profile");
  res.render("login", {});
});

router.get("/profile", (req, res) => {
  if(!req.session.user) return res.redirect("/pplogin");
  res.render("profile", {user: req.session.user});
});

router.get("/products", async (req, res) => {
  const limit = +req.query.limit || 10;
  const page = +req.query.page || 1;
  const query = req.query.query;
  const sort = +req.query.sort || 1;

  let products;
  if(query){
    products = await productsModel.paginate({category: query}, {page: page, limit: limit, sort: {price : sort}, lean: true});
  } else {
    products = await productsModel.paginate({}, {page: page, limit: limit, sort: {price : sort}, lean: true});
  }

  products = products.docs

  const user = req.session.passport.user? { firstName : req.session.passport.user.firstName,
     lastName  : req.session.passport.user.lastName, role: req.session.passport.user.role, cart_id: req.session.passport.user.cart_id} : "no existe usuario";
  const cart = req.session.passport.user.cart_id;
  // req.logger.warning( `${new Date().toDateString()} ${req.method} ${req.url}`);
  res.render("home", {products, user: user, cart});
});

router.get("/carts/:cid", async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCartById(cid);
  
  res.render("cartId", {data : cart, cid: cid});
});

router.get("/checkout", async (req, res) => {
  const cartId = req.session.passport?.user?.cart_id;

  if (!cartId) {
    return res.status(400).send("El usuario no tiene un carrito asociado");
  }

  const cart = await cartManager.getCartById(cartId);

  if (!cart || cart.products.length === 0) {
    return res.status(400).send("El carrito está vacío o no existe");
  }

  const totalPrice = cart.products
  .filter(product => product && product._id && product._id.price && product.quantity)
  .reduce((acc, product) => acc + product._id.price * product.quantity, 0);

  res.render("checkout", {
    cart: cart, 
    totalPrice: totalPrice,
    user: req.session.passport.user 
  });
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {user: req.session.user});
});

router.get("/reset-password/:token",  verifyToken, (req, res) => {
  const token = req.params.token;
  if (req.user) {
    res.render('reset-password', { user: req.user , token});
} else {
    res.status(403).send("Acceso denegado: Token no válido o expirado.");
}
});

router.get("/upload", (req, res) => {
  res.render("uploader", {user: req.session.user});
});

router.get("/welcome", async (req, res) => {
  const user = { name: "Agustina" };

  res.render("index", user);
});

router.get("/realtimeproducts", async (req, res) => {

  const limit = +req.query.limit || 10;

  const page = +req.query.page || 1;

  const query = req.query.query;

  const sort = +req.query.sort || 1;

  const products = await productManager.getProducts(limit, page, query, sort);

  res.render("realTimeProducts", { ...products,docs:products.docs.map(ed=>{return({title:ed.title,price:ed.price,thumbnail:ed.thumbnail,description:ed.description,id:ed._id+""})}) });;

});

router.get("/chat", verifyToken, handlePolicies(["USER"]), async (req, res) => {
  const messagesDb = await messagesModel.find().lean();
  res.render("chat", {data : messagesDb});
});

export default router;

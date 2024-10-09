import { Router } from "express";
import nodemailer from "nodemailer" ;
import twilio from "twilio";

import { CartsManager } from "../controllers/cart.manager.js";
import { TicketsManager } from "../controllers/tickets.manager.js";
import { verifyToken, handlePolicies, verifyMongoDBId} from "../services/utils.js";
import config from "../config.js";


const router = Router();

const manager = new CartsManager();
const ticketsManager = new TicketsManager();

// router.param("id", verifyMongoDBId)

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: config.GMAIL_APP_USER,
    pass: config.GMAIL_APP_PASS
  }
});

const twilioClient = twilio(config.TWILIO_SID, config.TWILIO_TOKEN)

router.get("/mail", async (req, res) => {
  try{
    let confirmation = await transport.sendMail({
      from: `Agustina Birn <${config.GMAIL_APP_USER}>`,
      to: "agusbirn@hotmail.com",
      subject: "PRUEBA NODEMAILER",
      html: "<h1>Prueba Nodemailer</h1>"
    });

    res.status(200).send({ status: "1", payload:  confirmation});
  } catch(err){
    res.status(401).send({ status: "1", payload: err.message });
  }
});

router.get("/sms", async (req, res) => {
  try{
    let confirmation = await twilioClient.messages.create({
      body: "Mensaje envido con Twilio", 
      from: config.TWILIO_PHONE,
      to: "+543512510631",
    });

    res.status(200).send({ status: "1", payload:  confirmation});
  } catch(err){
    res.status(401).send({ status: "1", payload: err.message });
  }
});

router.get("/", async (req, res) => {
  const limit = +req.query.limit || 0;
  const carts = await manager.getCarts(limit);
  res.status(200).send({ status: "1", payload: carts });
});

router.get("/:id", async (req, res) => {
  const cid = req.params.id;
  const cartId = await manager.getCartById(cid);
  res.status(200).send({ status: "1", payload: cartId });
});

router.get("/:id/purchase", verifyToken, async (req, res) => {
  try {
    req.session.user = req.user;
    const cid = req.params.id;
    const ticket = req.body
    const cartId = await ticketsManager.addTicket(cid, ticket);
    res.status(200).send({ status: "1", payload: cartId });
  } catch (err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message});
  }
});

router.post("/", async (req, res) => {
  req.body = { products: {}};
  const newCart = await manager.addCart(req.body);

  try {
    res.status(200).send({
      status: "1",
      payload: `Se agregó el carrito`,
    });
  } catch (err) {
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "No se agregó el carito",
      err,
    });
  }
});

router.post("/:id/products/:pid", verifyToken, handlePolicies(["self"]), async (req, res) => {

  const cid = req.params.id;
  const pid = req.params.pid;

  if (!req.session.user) {
    return res.status(401).send("Usuario no autenticado.");
  }

  const user = req.session.user;

  try {
    
    const newProduct = await manager.addProductsToCart(cid, pid, user._id);

    res.redirect(`/carts/${cid}`);

  } catch (err) {
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al agregar el producto"
    });
  }
});


router.put("/:id/products/:pid/:quantity", async (req, res) => {

  const cid = req.params.id;
  const pid = req.params.pid;
  const quantity = +req.params.quantity;
  
  try {
    const newProduct = await manager.updateProducts(cid, pid, quantity);
    res.status(200).send({
      status: "1",
      payload: `Se modificó el producto número: ${pid}`,
    });
  } catch (err) {
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al modificar el producto"
    });
  }
});

router.delete("/:id/products/:pid", async (req, res) => {
  try {
    const cid = req.params.id;
    const pid = req.params.pid;

    const cartId = await manager.removeProductToCart(cid, pid);
    res.redirect(`/carts/${cid}`)
} catch(err){
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al eliminar el producto"
    });
}
});

router.delete("/:id", async (req, res) => {
  try {const cid = req.params.id;
  const pid = req.params.pid;

  const cartId = await manager.removeAllProductsFromCart(cid, pid);
  res.status(200).send({ status: "1", payload: cartId })
} catch(err){
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al eliminar el producto"
    });
}
});

router.post('/checkout', async (req, res) => {
  const { email, address, phone, paymentMethod } = req.body;
  const user = req.session.user;

  const cartId = user.cart_id;

  try {
    const cart = await manager.getCartById(cartId);
    const totalPrice = cart.products
    .filter(product => product && product._id && product._id.price && product.quantity)
    .reduce((acc, product) => acc + product._id.price * product.quantity, 0);

    const emailOptions = {
      from: config.GMAIL_APP_USER,
      to: email,
      subject: 'Detalles de tu compra',
      text: `Gracias por tu compra. El total es $${totalPrice}. Método de pago: ${paymentMethod}.`,
    };
    await transport.sendMail(emailOptions);

    // Enviar SMS con los detalles de la compra
    // await twilioClient.messages.create({
    //   body: `Tu compra total es de $${totalPrice}. Método de pago: ${paymentMethod}.`,
    //   from: config.TWILIO_PHONE,
    //   to: phone,
    // });

    await manager.removeAllProductsFromCart(cartId);

    res.status(200).send({ message: 'Compra finalizada. Se ha enviado un email con los detalles.' });
  } catch (err) {
    console.error('Error en la compra:', err);
    res.status(500).send({ message: 'Error al procesar la compra' });
  }
});

export default router;

import { Router } from "express";

import config from "../config.js";

const router = Router();

router.get("/getcookies", async (req, res) => {
    try{
        res.status(200).send({status: 1, payload: req.signedCookies});
    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.get("/setcookies", async (req, res) => {
    try{
        res.cookie("cookie", "este es el contenido", {maxAge: 10000, signed: true})
        res.status(200).send({status: 1, payload: "Cookie"});
    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.get("/deletecookies", async (req, res) => {
    try{
        res.clearCookie("cookie")
        res.status(200).send({status: 1, payload: "Cookie eliminada"});
    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

export default router;
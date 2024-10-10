import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import express from "express";

import { UsersManager } from "../controllers/users.manager.js";
import { sendPasswordResetEmail, createHash, isValidPassword, verifyRequiredBody, createToken, verifyToken, passportCall } from "../services/utils.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import { CartsManager } from "../controllers/cart.manager.js";

import config from "../config.js";
import {uploader} from "../services/uploader.js";

const router = Router();

const manager = new UsersManager();
const cartManager = new CartsManager();

initAuthStrategies();

const handlePolicies = policies => {
    return async (req, res, next) => {
        if(policies === "PUBLIC") return next();
        const authHeaders = req.headers.authorization;
        
        if(!authHeaders) return res.status(401).send({origin: config.SERVER, payload: "No autorizado"});
        
        const token = authHeaders.split(" ")[1];
        let user = jwt.verify(token, config.SECRET);
        
        if(!policies.includes(user.role.toUpperCase())) return res.status(403).send({origin: config.SERVER, payload: "ACCESO DENEGADO, requiere otro nivel de rol"});
        
        req.user = user;
        
        next();
    }
};

const uploadRouter = express.Router();

uploadRouter.post('/:uid/products', uploader.array('productImages', 4), async (req, res) => {
    const userId = req.params.uid;

    const filter = {_id : userId};
    const update = {documents: [name = req.files.filename, path = req.files.path]}
    const options = {new: true}; 

    const uploadToUser = await manager.update(filter, update, options );


    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});

uploadRouter.post('/:uid/profiles', uploader.single('profileImages'), async (req, res) => {
    const userId = req.params.uid;

    const filter = {_id : userId};
    const update = {documents: [name = "identificación", path = req.files.path]}
    const options = {new: true}; 
    
    const uploadToUser = await manager.update(filter, update, options );

    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});

uploadRouter.post('/:uid/documents', uploader.array('documentImages', 3), async (req, res) => {
    const userId = req.params.uid;

    const filter = {_id : userId};
    const update = {documents: [name = req.files.filename, path = req.files.path]}
    const options = {new: true}; 
    
    const uploadToUser = await manager.update(filter, update, options );

    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});


router.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});


router.get("/counter", async (req, res) => {
    try{
        if(req.session.counter){
            req.session.counter++
        res.status(200).send({status: 1, payload: `Visitas: ${req.session.counter}`});
        } else{
            req.session.counter = 1;
            res.status(200).send({status: 1, payload: `Bienvenido, es tu primer visita`});
        }
    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});


router.put("premium/:uid", async (req, res) => {
    const userId = req.params.uid;

    try{
        
        const user = await manager.getUserById(userId);
        
        if(user.role === "user"){
            const hasIdentificationDocument = user.documents.some(doc => doc.name === "identificación");
            
            if (!hasIdentificationDocument) {
                return res.status(400).json({ message: "Primero debe verificar su perfil adjuntando el documento de identificación." });
            }

            const filter = { _id: user._id }; 
            const update = {role: "premium"};
            const options = {new: true};

            const updateUser = await manager.update(filter, update, options);
            res.status(200).json({ message: "Se modificó el rol del usuario a premium con éxito", user: updatedUser });

        } else if(user.role === "premium"){
            const filter = { _id: user._id }; 
            const update = {role: "user"};
            const options = {new: true};
            
            const updateUser = await manager.update(filter, update, options);
            res.status(200).json({ message: "Se modificó el rol del usuario a user con éxito", user: updatedUser });

        } else {
            res.status(400).json({ message: "No se puede modificar el rol de un usuario ADMIN" });
        };
    } catch(err){
        res.status(500).json({ message: 'Error al modificar el rol del usuario', error: err.message });
    }
})

router.post("/login", verifyRequiredBody(["email", "password"]), async (req, res) => {

    try {
        const { email, password } = req.body;
    
        const savedUser = await manager.findUserByEmail(email);

        if(savedUser && isValidPassword(password, savedUser.password)){
            const {password, ...filteredSavedUser} = savedUser;
            
            req.session.user = filteredSavedUser;

            const filter = { _id: savedUser._id }; 
            const update = {last_connection: Date.now()};
            const options = {new: true};

            const updateUser = await manager.update(filter, update, options);

            req.session.save(err => {
                if(err) return res.status(500).send({status: 500, payload: null, error: err.message});

                res.redirect("/products");
            })
        } else{
            return res.status(401).send({status: 1, payload: `Email o contraseña no válidos`});
        }} catch (err) {
        res.status(401).send({ status: 1, payload: null, error: err.message });
        }
});

router.post("/register", verifyRequiredBody(["firstName", "lastName", "email", "password", "age"]), async (req, res) => {
    try{

        const {firstName, lastName, email, password, age} = req.body;

        const savedUser = await manager.findUserByEmail(email);
        
        if(!savedUser) {
            const process = await manager.addUser({firstName, lastName, email, password: createHash(password), age});
            const createCart = await cartManager.addCart({ user_id: process._id, products: {}});
            
            const filter = { email : process.email};
            const update = { cart_id : createCart};
            const options = {new: true};
            const updateUser = await manager.update(filter, update, options);

            res.redirect("/login");
        } else {

            res.status(400).send({status: 1, payload: "ya existe un usuario con este email"})
        }} catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await manager.findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'El email no está registrado' });
        };

        const token = createToken({ email }, '1h');

        const resetLink = `${config.DIRNAME}/reset-password/${token}`;

        await sendPasswordResetEmail(email, resetLink);

        res.json({ message: 'Se envió un correo para restablecer la contraseña.' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: `Error al procesar la solicitud ${err.message}`});
    }
});

router.post('/reset-password/:token', verifyToken, async (req, res) => {
    const { password, confirmPassword } = req.body;
    const token = req.params.token

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        };
        const email = req.user.email;

        const user = await manager.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        };

        const hashedPassword = createHash(password);
        
        if(user.password === hashedPassword){
            return res.status(400).json({ message: 'La contraseña nueva debe ser diferente a contraseñas anteriores' });
        };

        const filter = { password : user.password};
        const update = {password: hashedPassword};
        const options = {new: true};
        const updateUser = await manager.update(filter, update, options)
        // await updateUser.save();
        // user.password = hashedPassword;
        // await user.save(err => {
        //     if(err) {
        //         return res.status(500).send({status: 500, payload: null, error: err.message})
        //     }

            
        // });;
        
        res.json({ message: 'Nueva contraseña guardada correctamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
});

router.get("/logout", async (req, res) => {
    try{
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        const filter = { _id: req.user._id }; 
        const update = {last_connection: today.toUTCString()};
        const options = {new: true};

        const updateUser = await manager.update(filter, update, options);   

        req.session.destroy((err) => {
            if(err) return res.status(500).send({status: 1, payload: "Error al ejecutar destroy", err})
            
            res.redirect("/login");
        });
        } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.post("/pplogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", {failureRedirect: `login?error=${encodeURI("Usuario o clave no válidos")}`}), async (req, res) => {
    try{
        req.session.user = req.user;
        const filter = { _id: req.user._id }; 
        const update = {last_connection: Date.now()};
        const options = {new: true};

        const updateUser = await manager.update(filter, update, options);   
        
        req.session.save(async err => {
            if(err) {
                return res.status(500).send({status: 500, payload: null, error: err.message})
            }
            res.redirect("/products");
            
        });
    } catch (err) {
        res.status(500).send({origin: config.SERVER, payload: null, error: err.message});
    }
});

router.get("/ghlogin", passport.authenticate("ghlogin", {scope: ["user"]}), async (req, res) => {

});

router.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/products');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.post("/jwtlogin", passport.authenticate("login", {failureRedirect: `login?error=${encodeURI("Usuario o clave no válidos")}`}), async (req, res) => {
    
    try {
        const filter = { _id: req.user._id }; 
        const update = {last_connection: Date.now()};
        const options = {new: true};

        const updateUser = await manager.update(filter, update, options);   

        const token = createToken(req.user, '1h');

        const user = req.user; 
        req.session.user = user;  

        res.cookie(`coder_cookie`, token, { maxAge: 60 * 60 * 1000}).redirect("/products");
        // res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado', token: token });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.post("/jwtlogincookie", verifyRequiredBody(["email", "password"]), passport.authenticate("login", {failureRedirect: `login?error=${encodeURI("Usuario o clave no válidos")}`}), async (req, res) => {
    try{
        req.session.user = req.user;
        
        const token= createToken(req.user, "1h");

        res.cookie("cookieToken", token, {maxAge: 60 * 60 * 1000, httpOnly: true})
        .send({message: "Logged in"});

        res.status(200).send({origin: config.SERVER, payload: "Usuario autenticado"});
        // res.status(200).send({origin: config.SERVER, payload: "Usuario autenticado", token: token});
        
    } catch (err) {
        res.status(500).send({origin: config.SERVER, payload: null, error: err.message});
    }
});

router.get("/private", async (req, res) => {
    try{
        if( !req.session.user || !req.session.user.role === "admin"){
            res.status(401).send({status: 1, payload: `Acceso denegado`});
            } else{
            res.status(200).send({status: 1, payload: `Eres admin ${req.session.user.name}`});
        }
    } catch(err){
        res.status(403).send({status: 1, payload: null, error: err.message})
    }
});

router.get("/admin", verifyToken, handlePolicies([ "ADMIN", "PREMIUM"]), async (req, res) => {
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido a control"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});

router.get("/verifytoken", verifyToken, handlePolicies("PUBLIC"), async (req, res) => {
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido por token"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});

router.get("/verifypassport", passport.authenticate("jwtlogin", {session: false}), async (req, res) => {
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido por passport"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});

router.get("/verifypassportcall", passportCall("jwtlogin"), async (req, res) => {
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido por passportCall"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});


export default router;
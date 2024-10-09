import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import nodemailer from 'nodemailer';


import config, {errorsDictionary} from "../config.js";
import CustomError from "./CustomError.class.js";

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (enteredPassword, savedPassword) => bcrypt.compareSync(enteredPassword, savedPassword);

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, {expiresIn: duration});

export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`]: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;
    const routeToken = req.params.token ? req.params.token : undefined;
    
    const receivedToken = headerToken || cookieToken || queryToken || routeToken;
    console.log("TOKEN RECIBIDO VERIFY = ", receivedToken);

    if (!receivedToken) return res.status(401).send({ origin: config.SERVER, payload: 'Se requiere token' });

    jwt.verify(receivedToken, config.SECRET, (err, credentials) => {
        if(err) return res.status(403).send({origin: config.SERVER, payload: ["Token no válido", receivedToken], err: err.message});

        req.user = credentials;
        next();
    });
};

export const passportCall = (strategy) => {
    return async(req, res, next) => {
        passport.authenticate(strategy, function(err, user, info) {
            if(err) return next(err);

            if(!user) {
                return res.status(401).send({error: info.messages ? info.messages : info.toString()});
            }

            req.user = user;
            next();
        })(req, res, next);
    }
};

export const verifyRequiredBody = (requiredFields) => {
    return ( req, res, next ) => {
        const allOk = requiredFields.every(field =>
            req.body.hasOwnProperty(field) && req.body[field] !== "" && req.body[field] !== null && req.body[field] !== undefined
        );

    //     if (!allOk) return res.status(400).send({ status:1, payload: "faltan propiedades", requiredFields}),
    if (!allOk) throw new CustomError(errorsDictionary.FEW_PARAMETERS);

        next();
    };
};

export const handlePolicies = policies => {
    return async (req, res, next) => {
        // if (!req.user) return res.status(401).send({origin: config.SERVER, payload: "Usuario no identificado"});
        // if (policies.includes(req.user.role)) return next();

        // res.status(403).send({origin: config.SERVER, payload: "No tiene permisos para acceder"});

        if(policies === "PUBLIC") return next();
        const authHeaders = req.headers.authorization;

        // if(!authHeaders) return res.status(401).send({origin: config.SERVER, payload: "No autorizado"});

        if (policies.includes("self") && req.user.cart_id === req.params.id) return next();
        const token = authHeaders.split(" ")[1];
        let user = jwt.verify(token, config.SECRET);

        if(!policies.includes(user.role.toUpperCase())) return res.status(403).send({origin: config.SERVER, payload: "ACCESO DENEGADO, requiere otro nivel de rol"});

        req.user = user;

        next();
    }
};

export const verifyMongoDBId = (id) => {
    return (req, res, next) => {
        if(!config.MONGODB_ID_REGEX.test(req.params.id)){
            res.status(400).send({ origin: config.SERVER, payload: null, error: "Id no válido"});
            throw new CustomError(errorsDictionary.INVALID_MONGOID_FORMAT);
        }
        next();
    }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        auth: {
          user: config.GMAIL_APP_USER,
          pass: config.GMAIL_APP_PASS
        }
      });

    const mailOptions = {
        from: `Agustina Birn <${config.GMAIL_APP_USER}>`,
        to: email,
        subject: 'Restablecer contraseña',
        text: `Por favor, haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`
    };

    await transport.sendMail(mailOptions);
};
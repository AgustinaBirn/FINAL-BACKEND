import winston from "winston";

import config from "../config.js";

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
    },

    colors: {
        fatal: "red",
        error: "orange",
        warn: "yellow",
        info: "blue",
        http: "black",
        debug: "white"
    }
}

const devLogger = new winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: customLevelsOptions.levels.debug,
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelsOptions.colors}),
                winston.format.simple()
            )
        })
    ]
});

const prodLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelsOptions.colors}),
                winston.format.simple()
            )
        }),
        new winston.transports.File({level: "warn", filename: `${config.DIRNAME}/logs/errors.log`})
    ]
});

const addLogger = (req, res, next) => {
    // req.logger = prodLogger;
    req.logger = config.MODE === "dev" ? devLogger : prodLogger;
    // req.logger.fatal( `${new Date().toDateString()} level fatal`);
    req.logger.error( `${new Date().toDateString()} ${req.method} ${req.url}`);
    // req.logger.warn( `${new Date().toDateString()} level error`);
    // podria anular esta linea de código para usarla de manera global y específica en cada endpoint que lo necesite
    next();
};

export default addLogger;
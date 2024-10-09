import * as url from "url";
import path from "path";
import {Command} from "commander";
import dotenv from "dotenv";

console.log(process.argv);

const commandLine = new Command();

commandLine
  .option("--mode <mode>")
  .option("--port <port>")

commandLine.parse();

const clOptions = commandLine.opts();
console.log(clOptions);

dotenv.config();

const config = {
  APP_NAME: 'coder',
  SERVER: "ATLAS_16",
  PORT: process.env.PORT || clOptions.port || 8080,
  DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
  // get UPLOAD_DIR() {
  //   return `${this.DIRNAME}/public/img`;
  // },
  get UPLOAD_DIR() {
    return `${this.DIRNAME}/uploads`;
  },
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
  SECRET: "coder",
  PRODUCTS_PER_PAGE: 5,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  PERSISTENCE: process.env.PERSISTENCE || 'mongo',
  GMAIL_APP_USER: "agusbirn@gmail.com",
  GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_TOKEN: process.env.TWILIO_TOKEN,
  TWILIO_PHONE: process.env.TWILIO_PHONE,
  MODE: "dev",
};

export const errorsDictionary ={
  UNHANDLED_ERROR: {code: 0, status: 500, message: "Error no identificado"},
  ROUTING_ERROR: {code: 1, status: 404, message: "No se encuentra el endpoint solicitida"},
  FEW_PARAMETERS: {code: 2, status: 400, message: "Faltan parámetros que son obligatorios o se han enviado vacíos"},
  INVALID_MONGOID_FORMAT: {code: 3, status: 400, message: "No contiene un formato válido el ID"},
  INVALID_PARAMETER: {code: 4, status: 400, message: "Parámetro ingresado no válido"},
  INVALID_TYPE_ERROR: {code: 5, status: 400, message: "El tipo de dato no corresponde"},
  ID_NOT_FOUND: {code: 6, status: 400, message: "No existe registro con ese ID"},
  PAGE_NOT_FOUND: {code: 7, status: 404, message: "No se encuentra la página solicitida"},
  DATABASE_ERROR: {code: 8, status: 500, message: "No se pudo conectar a la base de datos"},
  INTERNAL_ERROR: {code: 9, status: 500, message: "Error interno al ejecutar el servidor"},
  RECORD_CREATION_ERROR: {code: 10, status: 500, message: "Error al crear el registro"},
  RECORD_CREATION_OK: {code: 11, status: 200, message: "Registro creado con éxito"},
}

export default config;

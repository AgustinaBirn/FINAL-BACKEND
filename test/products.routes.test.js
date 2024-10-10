import * as chai from "chai";
import supertest from 'supertest';
import productRoutes from "../src/routes/products.routes.js";
import config from "../src/config.js";

const expect = chai.expect;
const requester = supertest('http://localhost:8080');
const testProduct = {title: "Pantalón prueba",

    description: "testeo de pantalon",
    
    price: 13500,
    
    stock: 3,
    
    state: true,
    
    category: "pantalones",
    
    code: 156731,
    
    owner: "premium"};
const testUser = { firstName: 'Juan', lastName: 'Perez', age: 35, email: 'pppeeEerrezzz@gmail.com', password: 'abc445', role: "ADMIN"};
let cookie = {};

 

describe('Test products routes', function () {

    before(async function () {});

    beforeEach(async function () {});

    after(function () {});

    afterEach(function () {});

    it('POST /api/auth/register debe registrar un nuevo usuario', async function () {
        const { _body }  = await requester.post('/api/auth/register').send(testUser);

        expect(_body.error).to.be.undefined;
        expect(_body.payload).to.be.ok;
    });

    it('POST /api/auth/jwtlogin debe ingresar correctamente al usuario', async function () {
        const result = await requester.post('/api/auth/jwtlogin').send( testUser.email, testUser.password);
        const cookieData = result.headers['set-cookie'][0];
        console.log(cookieData);
        // cookie = { name: cookieData.split('=')[0], value: cookieData.split('=')[1] };

        // expect(cookieData).to.be.ok;
        // // expect(cookie.name).to.be.equals('coderbackend-app_cookie');
        // expect(cookie.value).to.be.ok;
    });
    
 
    // it('GET /api/products debe devolver todos los productos', async function () {
    //     const { _body }  = await requester.get('/api/products');
    //     console.log(_body);

    //     expect(_body.error).to.be.undefined;
    //     expect(_body.payload).to.be.ok;
    // });

    // it('POST /api/products debe crear un nuevo producto', async function () {
    //     const { _body } = await requester
    //         .post('/api/products')
    //         // .set('Cookie', `${cookie.name}=${cookie.value}`) // Enviar la cookie correctamente
    //         .send(testProduct);

    //     console.log('Respuesta:', _body); // Debug

    //     expect(_body.error).to.be.undefined;
    //     expect(_body.payload).to.be.an('object');
    //     expect(_body.payload).to.have.property('_id');
    //     testProduct._id = _body.payload._id;
    // });

    // it('POST /api/products debe crear un nuevo producto', async function () {
    //     console.log('Cookie enviada:', `${cookie.name}=${cookie.value}`); 
    //     const { _body } = await requester
    //         .post('/api/products')
    //         .set('Cookie', `${cookie.name}=${cookie.value}`)
    //         .send(testProduct);
    
    //     expect(_body.error).to.be.undefined;
    //     expect(_body.payload).to.be.an('object');
    //     expect(_body.payload).to.have.property('_id');
    //     testProduct._id = _body.payload._id;
    // });
    

    it('POST /api/products debe crear un nuevo producto', async function () {
        const  _body   = await requester.post('/api/products').send(testProduct).set('Authorization', `Bearer ${cookie.value}`);
        console.log("COOKIE =", cookie);
        console.log(_body.text);
        // testProduct._id = _body._id

        // expect(statusCode).to.be.equals(400);
    });

    // it('GET /api/products/:id debe devolver un producto determinado según id', async function () {
    //     const { _body }  = await requester.get('/api/products/:id').send(testProduct);
    //     console.log(_body.text);

    //     // expect(_body.error).to.be.undefined;
    //     // expect(_body.payload).to.be.ok;
    // });



});
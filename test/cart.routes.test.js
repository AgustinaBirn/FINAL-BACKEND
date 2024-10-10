import * as chai from "chai";
import supertest from 'supertest';

const expect = chai.expect;
/**
 * Utilizamos el requester de supertest para poder realizar solicitudes
 * http, es decir, realizar los tests desde los propios endpoints
 */
const requester = supertest('http://localhost:8080');
const testUser = { firstName: 'Juan', lastName: 'Perez', age: 35, email: 'jjperez@gmail.com', password: 'abc445' };
let cookie = {};

describe('Test Integración Users', function () {

    it('POST /api/auth/register debe registrar un nuevo usuario', async function () {
        const { _body }  = await requester.post('/api/auth/register').send(testUser);

        expect(_body.error).to.be.undefined;
        expect(_body.payload).to.be.ok;
    });

    it('POST /api/auth/register NO debe volver a registrar el mismo mail', async function () {
        const { statusCode, _body }  = await requester.post('/api/auth/register').send(testUser);

        expect(statusCode).to.be.equals(400);
    });

    it('POST /api/auth/login debe ingresar correctamente al usuario', async function () {
        const { _body } = await requester.post('/api/auth/login').send(testUser);
        // const cookieData = result.headers['set-cookie'][0];
        // cookie = { name: cookieData.split('=')[0], value: cookieData.split('=')[1] };

        // expect(cookieData).to.be.ok;
        // expect(cookie.name).to.be.equals('coderCookie');
        // expect(cookie.value).to.be.ok;
        expect(_body.error).to.be.undefined;
        expect(_body.payload).to.be.ok;
    });

    it('POST /forgot-password debe enviar un correo de recuperación de contraseña', async function () {
        const response = await requester.post('/forgot-password')
            .send({ email: testUser.email })
            .timeout(5000);

        const { statusCode, _body } = response;
        expect(statusCode).to.be.equals(200);
        expect(_body.message).to.be.equals('Se envió un correo para restablecer la contraseña.');
    });
    // it('GET /api/auth/current debe retornar datos correctos de usuario', async function () {
    //     const { _body } = await requester.get('/api/auth/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);

    //     expect(_body.payload).to.have.property('name');
    //     expect(_body.payload).to.have.property('role');        
    //     expect(_body.payload).to.have.property('email').and.to.be.eql(testUser.email);
    // });
});

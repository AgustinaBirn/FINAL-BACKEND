import {UsersService} from '../services/user.dao.mdb.js';

const service = new UsersService();

export class UsersManager {
    constructor() {
    }

    getUserById = async (id) => {
        try {
            return await service.getProductById(id);
        } catch (err) {
            return err.message;
        };
    };

    getUsers = async () => {
        try {
            return await service.getUsers();
        } catch (err) {
            return err.message;
        };
    };

    findUserByEmail = async (email) => {
        try {
            return await service.findUserByEmail(email);
        } catch (err) {
            return err.message;
        };
    };

    addUser = async (user) => {
        try {
            return await service.addUser(user);
        } catch (err) {
            return err.message;
        };
    };

    update = async (filter, update, options) => {
        try {
            return await service.update(filter, update, options);
        } catch (err) {
            return err.message;
        };
    };
}

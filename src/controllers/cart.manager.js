import {CartsService} from '../services/cart.dao.mdb.js';

const service = new CartsService();

export class CartsManager {
    constructor() {
    }
    
    getCarts = async (limit) => {
        try {
            return await service.getCarts(limit);
        } catch (err) {
            return err.message;
        };
    };

    getCartById = async (filter) => {
        try {
            return await service.getCartById(filter);
        } catch (err) {
            return err.message;
        };
    };

    addCart = async (cart) => {
        try {
            return await service.addCart(cart);
        } catch (err) {
            return err.message;
        };
    };

    updateProducts = async (cid, pid, quantity) => {
        try {
            return await service.updateProducts(cid, pid, quantity);
        } catch (err) {
            return err.message;
        };
    };

    addProductsToCart = async (cid, pid) => {
        try {
            return await service.addProductsToCart(cid, pid);
        } catch (err) {
            return err.message;
        };
    };

    removeProductToCart = async (cid, pid) => {
        try {
            return await service.removeProductToCart(cid, pid);
        } catch (err) {
            return err.message;
        };
    };

    removeAllProductsFromCart = async (cid) => {
        try {
            return await service.removeAllProductsFromCart(cid);
        } catch (err) {
            return err.message;
        };
    };

    deleteProduct = async (filter) => {
        try {
            return await service.deleteProduct(filter);
        } catch (err) {
            return err.message;
        };
    };
}
import {ProductsService} from '../services/products.dao.mdb.js';
const service = new ProductsService();

class ProductsDTO {
    constructor(product) {
        this.product = product;
        this.product.title = this.product.title.toUpperCase();
    }
}

export class ProductsManager {
    constructor() {
    }

    getProductById = async (filter) => {
        try {
            return await service.getProductById(filter);
        } catch (err) {
            return err.message;
        };
    };

    getProducts = async (limit = 0, page = 1) => {
        try {
            return await service.getProducts(limit, page);
        } catch (err) {
            return err.message;
        };
    };

    addProduct = async (newData) => {
        try {
            const normalizedData = new ProductsDTO(newData);
            return await service.addProduct(normalizedData.product);
        } catch (err) {
            return err.message;
        };
    };

    updateProduct = async (filter, update, options) => {
        try {
            return await service.updateProduct(filter, update, options);
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


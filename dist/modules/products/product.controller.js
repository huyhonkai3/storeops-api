import { AppError } from "../../errors/app-error.js";
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct, } from "./product.service.js";
export const getAllProducts = async (_req, res) => {
    const query = res.locals.validatedQuery;
    const products = await getProducts(query);
    res.status(200).json(products);
};
export const getOneProduct = async (req, res) => {
    const id = Number(req.params.id);
    const product = await getProductById(id);
    if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
        return;
    }
    res.status(200).json(product);
};
export const addProduct = async (req, res) => {
    const product = await createProduct(req.body);
    res.status(201).json(product);
};
export const editProduct = async (req, res) => {
    const id = Number(req.params.id);
    const product = await updateProduct(id, req.body);
    if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
        return;
    }
    res.status(200).json(product);
};
export const removeProduct = async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await deleteProduct(id);
    if (!deleted) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }
    res.status(204).send();
};

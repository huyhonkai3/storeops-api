import { prisma } from "../../lib/prisma.js";
export const getProducts = async (query) => {
    const { page, limit, search, minPrice, maxPrice, minStock, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    sku: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),
        ...(minPrice !== undefined ||
            maxPrice !== undefined ||
            maxPrice !== undefined
            ? {
                price: {
                    ...(minPrice !== undefined && {
                        gte: minPrice,
                    }),
                    ...(maxPrice !== undefined && {
                        lte: maxPrice,
                    }),
                },
            }
            : {}),
        ...(minStock !== undefined && {
            stock: {
                gte: minStock,
            },
        }),
    };
    const orderBy = sortBy === "name"
        ? { name: sortOrder }
        : sortBy === "price"
            ? { price: sortOrder }
            : sortBy === "stock"
                ? { stock: sortOrder }
                : { createdAt: sortOrder };
    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        }),
        prisma.product.count({
            where,
        }),
    ]);
    return {
        data: products,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getProductById = async (id) => {
    return prisma.product.findUnique({
        where: {
            id,
        },
    });
};
export const createProduct = async (input) => {
    return prisma.product.create({
        data: {
            name: input.name,
            sku: input.sku,
            price: input.price,
            stock: input.stock,
        },
    });
};
export const updateProduct = async (id, input) => {
    const product = await prisma.product.findUnique({
        where: {
            id,
        },
    });
    if (!product) {
        return null;
    }
    return prisma.product.update({
        where: {
            id,
        },
        data: input,
    });
};
export const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({
        where: {
            id,
        },
    });
    if (!product) {
        return false;
    }
    await prisma.product.delete({
        where: {
            id,
        },
    });
    return true;
};

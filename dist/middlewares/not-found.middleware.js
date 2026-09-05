import { AppError } from "../errors/app-error.js";
export const notFoundHandler = (req, _res, next) => {
    next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`));
};

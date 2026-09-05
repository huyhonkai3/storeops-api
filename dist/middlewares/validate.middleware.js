import { AppError } from "../errors/app-error.js";
const formatErrors = (issues) => {
    return issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
    }));
};
export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(new AppError(400, "VALIDATION_FAILED", "Validation failed", formatErrors(result.error.issues)));
            return;
        }
        req.body = result.data;
        next();
    };
};
export const validateParams = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            next(new AppError(400, "VALIDATION_FAILED", "Validation failed", formatErrors(result.error.issues)));
            return;
        }
        next();
    };
};
export const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next(new AppError(400, "VALIDATE", "Validation failed", formatErrors(result.error.issues)));
            return;
        }
        res.locals.validatedQuery = result.data;
        next();
    };
};

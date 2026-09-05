import { register } from "./auth.service.js";
export const registerUser = async (req, res) => {
    const user = await register(req.body);
    res.status(201).json({
        data: user,
    });
};

import { verifyAccessToken } from "../utils/jwt.utils.js";

export const protect = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
        return res.status(401).json({ error: 'Unauthorized' })

    const token = header.split(' ')[1];
    try{
        const payload = verifyAccessToken(token);
        req.user = { id: payload.userId };
        next()
    }catch(e) {
        return res.status(401).json({ error : "invalid or expired json" })
    }
};
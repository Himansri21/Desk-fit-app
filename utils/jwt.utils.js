import jwt from "jsonwebtoken";

export const signAccessToken = (payload) => 
    jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
    });

export const verifyAccessToken = (token) => 
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);
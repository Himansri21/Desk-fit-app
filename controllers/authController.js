import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import { signAccessToken } from '../utils/jwt.utils.js';

export const signup = async (req, res) => {
    const {email, username, password} = req.body;
    try{
        const existing = await prisma.user.findFirst({
            where: {OR: [{email}, {username}]}
        });
        if (existing) return res.status(409).json({ error: "User already exists "})

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data : {email, username, passwordHash},
        });
        const accessToken = signAccessToken({userId : user.Id});
        res.status(201).json({ user, accessToken })
    }catch (err){
        res.status(500).json({ error: 'Signup failed' })
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await prisma.user.findUnique({ where : {email} });
        if (!user) return res.status(401).json( { error : "invalid username" } )

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json( { error : "incorrect password" })

        const accessToken = signAccessToken({ userId: user.id })
        res.json({ user, accessToken})
    }catch(err){
        res.status(500).json({ error: 'Login failed' })
    }
}
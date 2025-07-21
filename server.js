import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const port = 3001

app.use(express.json());

import users from './users.js'

app.use(cors({
  origin: '*'
}));


let UserToMatch = [];

app.use(cors({
    origin:"http://localhost:3000",
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization']
}));

app.get('/new_app',(req,res) =>{
    console.log(app.mountpath)
    res.send('this is homepage')
})

app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})

app.get('/users',(req,res) => {
    res.json(users);
})

// app.post('/putUser',(req,res)=>{
//     const{username,intime,outtime} = req.body;
//     UserToMatch.push({username,intime,outtime});
//     console.log(UserToMatch);
//     res.send(UserToMatch)
// })

app.post('/putUser',async (req,res)=>{
    const{username,intime,outtime} = req.body;
    try{
        const user = await prisma.user.create({
            data: {username, intime: Number(intime), outtime: Number(outtime)
            }
        });
        res.status(201).json(user);
    }catch(err){
        console.error("there was error sending data to db");
        res.status(501).json({message: "error adding data"})
    }
});


// app.post('/Authorization',async (req,res)=>{
//     const{email, password} = req.body;
//     try{
//         if(email == "himanshu"){
//             if(password == "himanshu"){
//                 res.status(200).json({success: 'true', message:'login successful'});
//             }else{
//                 res.status(401).json({success: 'false', message:'login unsuccessful'});
//             }
//         }
//     }catch(err){
//         console.err("could not verify the user");
//         return res.status(501).json({success: false, message: "Internal server error"})
//     }
// })

app.post('/Authorization', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === "himanshu") {
      if (password === "himanshu") {
        return res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error("Could not verify the user:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

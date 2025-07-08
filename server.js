import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001

app.use(express.json());

import users from './users.js'

app.use(cors())
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

app.post('/putUser',(req,res)=>{
    const{username,intime,outtime} = req.body;
    UserToMatch.push({username,intime,outtime});
    console.log(UserToMatch);
    res.send(UserToMatch)
})
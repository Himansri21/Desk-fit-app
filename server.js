import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001
import users from './users.js'

app.use(cors())

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
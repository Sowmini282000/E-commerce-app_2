require('dotenv').config({path:'./../config.env'});
 
const express=require('express');
const PORT=process.env.PORT;
const app=express();
const cookieParser = require("cookie-parser");


require('./DB/connection');



app.use(express.json());
app.use(cookieParser());
app.use(require('./router/auth'));








app.get('/',(req,res)=>{
    res.send("hello");
})


app.listen(PORT,()=>{
    console.log("SERVER IS RUNNING",PORT);
});


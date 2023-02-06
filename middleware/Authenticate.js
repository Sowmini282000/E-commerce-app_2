const jwt=require('jsonwebtoken');
const User = require('../src/modals/userSchema');
const cookie=require('cookie-parser');


const Authenticate =async (req,res,next) =>{


    try{
        const token = req.cookies.jwt;

        const verifytoken =jwt.verify(token,process.env.SECRET_KEY);


        const rootUser = await User.findOne({_id:verifytoken._id,"tokens.token":token});

        if(!rootUser){
            console.log("----error---");
            throw new Error("User Not Found");

        }
        
        req.token=token;
        req.rootUser=rootUser;
        req.UserID=rootUser._id;

        next(); 


    }catch(err){
        res.status(401).send('Unauthorized:No token provided');
        console.log(err);
    }

}


module.exports=Authenticate;
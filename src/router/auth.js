const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailvalidate = require('email-validator');
const authenticate = require('../../middleware/Authenticate');
const cookie = require('cookie-parser');
const mailgun = require("mailgun-js");
const DOMAIN = 'https://api.mailgun.net/v3/sandbox8f099c86b83f4ca3ad4fa138ca0c6d9d.mailgun.org';
const mg = mailgun({ apiKey: '605ab48a4ad72ce190e818382e48acdd-443ec20e-8c3d32ff', domain: DOMAIN });

require('./../DB/connection');
const User = require('./../modals/userSchema');



let token;


/* --------------Using Promises---------------------------------- */

// router.post('/register',async (req, res) => {

//     const { name, email, phone, password, cpassword } = req.body;

//     if (!name || !email || !phone || !password || !cpassword) {
//         return res.status(422).json({ error: "filled details" });
//     }

//     User.findOne({ email: email })
//         .then((userExist) => {
//             if (userExist) {
//                 return res.status(422).json({ error: "email already exist" });
//             }

//             const user = new User({ name, email, phone, password, cpassword });

//             user.save().then(() => {
//                 res.status(201).json({ message: "successfully" });
//             }).catch((err) => {
//                 res.status(501).json({ error: "failed to register" });
//             })

//         }).catch((err)=>{console.log(err)});

// });

/* --------------Using Asyncs---------------------------------- */

router.post('/signup', async (req, res) => {
    console.log("connected");



    const { name, email, phone, password, cpassword } = req.body;



    if (!name || !email || !phone || !password || !cpassword) {

        return res.status(400).json({ error: "filled details" });
    }
    else if (isNaN(phone)) {
        return res.status(401).json({ error: "Phone Number is Invalid" });
    }
    else if (!emailvalidate.validate(email)) {
        return res.status(402).json({ error: "Wrong Email" });
    }

    try {

        const userExist = await User.findOne({ email: email });
        const userExist1 = await User.findOne({ phone: phone });

        if (userExist) {
            return res.status(422).json({ error: "email already exist" });
        }
        else if (userExist1) {
            return res.status(423).json({ error: "Mobile Number already exist" });
        }
        else if (password !== cpassword) {
            return res.status(423).json({ error: "password are not matched" });
        }
        else {
            const user = new User({ name, email, phone, password, cpassword });

            const result = await user.save();


            if (result) {
                res.status(201).json({ message: "successfully" });
                console.log("successfully registration");
            } else {
                res.status(500).json({ error: "Failed to registered" });
            }

        }
    } catch (err) {
        console.log(err);
    }

});

/* ---------------------- Login -------------------------------------------*/

router.post('/signin', async (req, res) => {

    try {


        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please filled the data" });
        }

        console.log(email, password);


        const userLogin = await User.findOne({ email: email });
        console.log(userLogin);
        let isMatch;
        if (userLogin) {
            isMatch = await bcrypt.compare(password, userLogin.password);

            token = await userLogin.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now + 2589200000),
                httpOnly: true
            });
        }
        else {
            res.status(401).json({ message: "Invalid Credientials" });
        }

        if (!isMatch) {
            res.status(403).json({ message: "Invalid Password" });
        }

        else {
            res.status(200).json({ message: "Successfully" });
        }


    } catch (err) {
        console.log(err);
    }
})
/* ---------------------- Profile -------------------------------------------*/

router.get('/profile', authenticate, (req, res) => {
    res.send(req.rootUser);
})


/* ---------------------- Payment -------------------------------------------*/

router.get('/payment', authenticate, (req, res) => {
    res.send(req.rootUser);
    console.log("-->");
})



/* ---------------------- Logout -------------------------------------------*/
router.get('/logout', authenticate, async (req, res) => {

    // req.user.tokens=req.user.tokens.filter((currele)=>{
    //         return currele.token !== req.token;
    //     });
    try {
        req.rootUser.tokens = [];
        res.clearCookie('jwt', { path: '/' });

        await req.rootUser.save();


        console.log("Hello my logout page");


        res.send('User Logout');
        res.send(req.rootUser);
    }
    catch (err) {
        console.log(err);
    }

})


/* ---------------------- AddToCart -------------------------------------------*/


router.post('/addtocart', authenticate, async (req, res) => {

    const { name, image, price, quantity } = req.body;

    try {

        const Product = await User.findOne({ _id: req.UserID, "cart.name": name });
        if (!Product) {
            const id = req.rootUser.cart.length + 1;

            req.rootUser.cart = req.rootUser.cart.concat([{ id, name, image, price, quantity }]);

            const result = await req.rootUser.save();
            console.log("result");
            if (result) {
                res.status(201).json({ message: "successfully" });
                console.log("Add Successfully");
            } else {
                res.status(400).json({ error: "Failed to Add" });
            }
        }
        else {
            console.log("Product Fount");
            res.status(400).json({ error: "Already Found" });
        }


    }
    catch (err) {
        console.log(err);
    }


})


/* ---------------------- ExtractAllData -------------------------------------------*/

router.get('/cart', authenticate, async (req, res) => {
    console.log("extract all data");
    var id = 0;
    // console.log(req.rootUser.cart);
    var array = req.rootUser.cart
    array.map((e) => {
        e.id = id + 1;
        id = id + 1;
    });
    req.rootUser.cart = array;
    await req.rootUser.save();
    res.send(req.rootUser.cart);
})

module.exports = router;

/* ---------------------- Clear Cart -------------------------------------------*/

router.post('/clearcart', authenticate, async (req, res) => {
    console.log("clear cart");
    req.rootUser.cart = [];
    await req.rootUser.save();
})

/* ---------------------- Increament Quantity -------------------------------------------*/

router.post('/quantityincreament', authenticate, async (req, res) => {
    console.log("increament");
    console.log(req.body.id);
    try {

        req.rootUser.cart[req.body.id - 1].quantity += 1;
        console.log(req.rootUser.cart[req.body.id - 1].quantity)
        await req.rootUser.save();

    }
    catch (err) {
        console.log(err);
    }
})


/* ---------------------- Decreament Quantity -------------------------------------------*/

router.post('/quantitydecreament', authenticate, async (req, res) => {
    console.log("decreament");
    console.log(req.body.id);
    try {

        if (req.rootUser.cart[req.body.id - 1].quantity > 1) {
            console.log(req.rootUser.cart[req.body.id - 1].quantity)
            req.rootUser.cart[req.body.id - 1].quantity -= 1;
            req.rootUser.save();
        }

    }
    catch (err) {
        console.log(err);
    }
});


/* ---------------------- Delete -------------------------------------------*/

router.post('/carddelete', authenticate, async (req, res) => {
    console.log("delete");
    console.log(req.body.id);
    var id = 0;
    // req.user.tokens=req.user.tokens.filter((currele)=>{
    //         return currele.token !== req.token;
    //     });

    var array = req.rootUser.cart.filter((currele) => {
        return currele.id !== req.body.id;
    });
    req.rootUser.cart = array;
    await req.rootUser.save();




});

/* ---------------------- Generate OTP -------------------------------------------*/

function generate(n) {
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
        return generate(max) + generate(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
}




/* ---------------------- Request OTP -------------------------------------------*/

var finalotp;
var mobilenumber;


router.post('/requestotp', async (req, res) => {
    console.log("resert password");
    const { email } = req.body;

    const user = await User.findOne({ phone: email });

    if (user) {
        var otp1 = generate(6);
        finalotp = otp1;
        mobilenumber = email;

        console.log(finalotp);
        return res.status(200).json();
    }
    else {
        return res.status(100).json();
    }



    // const fast2sms = require('fast-two-sms')
    // const YOUR_API_KEY = 'f2aSYIwcoHCDjyeZrp4F1kvBT8EhAXmzUJRWLN5l0sxg67t9QKilG9KHdMhFk8QLvXVZmrwcWUPTya1O';
    // var options = { authorization: YOUR_API_KEY, message: `${generate(6)}`, numbers: [`${email}`] };
    // fast2sms.sendMessage(options)


})

router.post('/verifyotp', async (req, res) => {
    const { otp } = req.body;

    if (otp == finalotp) {
        console.log("matched");
        return res.status(200).json();
    }
    else {
        console.log("not matched");
        return res.status(402).json();
    }
});

/* ---------------------- Change Password -------------------------------------------*/

router.post('/changepassword', async (req, res) => {
    const { password, cpassword } = req.body;
    const pass = await bcrypt.hash(password, 12);
    try {

        const result = await User.updateOne({ phone: mobilenumber }, {
            $set: {
                password: pass,
                cpassword: pass
            }
        });
        return res.status(200).json();

    } catch (err) {
        console.log(err);
    }

});




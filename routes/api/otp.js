const express = require('express');
const router = express.Router();
const send = require("../../controllers/sendOTP")
const verify = require("../../controllers/verifyOTP")


router.post("/send",async (req,res)=>{
console.log(req.body)
send(res,req.body.email,req.body.firstName)

})

router.post("/verify",async (req,res)=>{

    verify(res,req.body.email,req.body.otp)
    
    })


module.exports = router
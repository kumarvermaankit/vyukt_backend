// const express=require('express');
// const nodemailer=require('nodemailer');
const OTP = require("../models/Otp")

async function verify(res,email,otp){
    try{
        const result = await OTP.findOne({email:email})
        console.log(result)
        console.log(otp)
        if(result.otp === otp){
            res.status(200).json({
                success: true,
                message: `OTP Verified successfully`
              }); 
        } 
        else{
            res.status(200).json({
                success: false,
                message: `Incorrect OTP`
                
              }); 
        }   
        
    }
    catch(err){
        res.status(200).json({
            success: false,
            message: `Incorrect OTP`,
            error:err
          }); 
    } 
   
}

module.exports = verify
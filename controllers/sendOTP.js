

const OTP = require("../models/Otp")
const main = require("./sendMail")
const sendEmail = require("./mailer")


    
async function send(res,email,firstname){
   
try{


var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);


const res1 = await OTP.findOne({email:email})

if(res1){
  res1.otp = otp
  res1.save()
}
else{
  const OTPvalue = new OTP({
      email:email,
      otp:otp
  })
  const res2 = OTPvalue.save()

  console.log(res2)
}

var content = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Vyukt</a>
  </div>
  <p style="font-size:1.1em">Hi ${firstname},</p>
  <p>Thank you for choosing us. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>Team Vyukt</p>
   
  </div>
</div>
</div>`

var subject = `Otp for registration is: ${otp}`

sendEmail({content:content,subject:subject,to:email})
.then((val)=>{
     res.status(200).json({
      
      success:true,
    }) 

})
.catch((err) => console.error(err));


// main(content,subject,email)
//   .then((messageId) => {console.log('Message sent successfully:', messageId)
//     res.status(200).json({
//       success:true,
//       message:messageId
//     })
// })
//   .catch((err) => console.error(err));

}

catch(err){
  console.log(err)
res.status(404).json({
  success: true,
  message: err
  
}); 
}

};


module.exports = send
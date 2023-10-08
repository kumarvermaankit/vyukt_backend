
 const smtpTransport = require('nodemailer-smtp-transport');
 const nodemailer = require("nodemailer")


//  const transporter = nodemailer.createTransport(smtpTransport({
//     host:'smtpout.secureserver.net',
//     secureConnection: true,
//     tls: {
//       rejectUnauthorized: true
//     },
//     port: 587,
//     auth: {
//         user: "help@vyukt.com",
//         pass: "Mattmurdock@123",
//   }
// }));


const transporter = nodemailer.createTransport({
    service: "gmail",
    application: "bfy",
    auth: {
      user: "bfyhelp@gmail.com",
      pass: "iqdh nmzh fzoz mftc ",
    },
  });


const sendEmail = async options =>{
    //1)Create a transporter
    try{
   
        console.log(options.cg)

    //2) Define the mail options
  
        const mailOptions = {
            from:'Bfy <bfyhelp@gmail.com>',
            to:options.to,
            subject:options.subject,
            html:options.content
        }
        //3) Actually send the email
        await transporter.sendMail(mailOptions);
       
    }
 catch(err){
    console.log(err)
 }
    };

// sendEmail({cg:"hello",to:"tosendankit@gmail.com",subject:"Team vyukt",content:"hola amigos"})

module.exports = sendEmail
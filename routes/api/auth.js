const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');

const auth = require('../../middleware/auth');

// Bring in Models & Helpers
const User = require('../../models/user');
const mailchimp = require('../../services/mailchimp');
const mailgun = require('../../services/mailgun');
const keys = require('../../config/keys');
const sendEmail = require("../../controllers/mailer")


const { secret, tokenLife } = keys.jwt;

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ error: 'No user found for this email address.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Password Incorrect'
      });
    }

    if(user.avatar == "temporary"){
      user.avatar = "permanent"
      user.save()
    }

    const payload = {
      id: user.id
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    if (!token) {
      throw new Error();
    }

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/register', async (req, res) => {
  console.log(req.body)
  try {
    var { email, firstName, lastName, password, isSubscribed } = req.body;

    if (!email) {
      console.log('You must enter an email address.')
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!firstName || !lastName) {
      console.log('You must enter your full name.')

      return res.status(400).json({ error: 'You must enter your full name.' });
    }

    if (!password) {
      console.log('You must enter a password.')
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("email already use")
      console.log(existingUser)
      if(existingUser.avatar == "temporary"){

        existingUser.avatar = "permanent";
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        password = hash;
        existingUser.password = password;
        existingUser.save();
        const payload = {
          id: existingUser.id
        };

        const token = jwt.sign(payload, secret, { expiresIn: tokenLife });
        return res.status(200).json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: existingUser.id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            role: existingUser.role
          }
        });
      
      }
      else{
        return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
      }
    }

    const avatar = "permanent"

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      avatar
    });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);


    user.password = hash;

    const registeredUser = await user.save();

    const payload = {
      id: registeredUser.id
    };

    // await mailgun.sendEmail(
    //   registeredUser.email,
    //   'signup',
    //   null,
    //   registeredUser
    // );



    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });
    console.log("hello")
    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: registeredUser.id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role
      }
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});


router.post('/tempregister', async (req, res) => {
  try {
    const { email, firstName, lastName} = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    console.log("email",email)

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'You must enter your full name.' });
    }

    // if (!password) {
    //   return res.status(400).json({ error: 'You must enter a password.' });
    // }

    console.log("lastname",lastName)

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(200)
        .json({ error: 'That email address is already in use.',user:existingUser });
    }

    // generate password fron email first portion and add @123 after that
    const password = email.split('@')[0] + '@123';
    const avatar = "temporary"
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      avatar:avatar
      
    });
    console.log("avatae",avatar)
    console.log("tempuser",user)
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);


    user.password = hash;

    const registeredUser = await user.save();

    user['role'] = registeredUser.role

    const content = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Bfy</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing us.</p>
      <p>Use the following id and password to sign in , you can change your password after login.</p>
      <p>Id: ${email}</p>
      <p>Password: ${password}</p>
      <p style="font-size:0.9em;">Regards,<br />Team Bfy</p>
      <hr style="border:none;border-top:1px solid #eee" />
    </div>
    </div>`

    const subject = "Buyforyou login id and password"
    
    // cartDoc.products.map((each)=>{
      
    // })

    res.status(200).json({
      success: true,
      message: `Thanks for registering. Please check your email for the confirmation link to complete your registration.`,
      user: registeredUser
    });

    sendEmail({content:content,subject:subject,to:email})
.then(()=>{
  console.log("email sent")

})

  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
})

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .send({ error: 'No user found for this email address.' });
    }

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');

    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = Date.now() + 3600000;

    existingUser.save();

    await mailgun.sendEmail(
      existingUser.email,
      'reset',
      req.headers.host,
      resetToken
    );

    res.status(200).json({
      success: true,
      message: 'Please check your email for the link to reset your password.'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const resetUser = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!resetUser) {
      return res.status(400).json({
        error:
          'Your token has expired. Please attempt to reset your password again.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    resetUser.password = hash;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpires = undefined;

    resetUser.save();

    await mailgun.sendEmail(resetUser.email, 'reset-confirmation');

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/reset', auth, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.user.email;

    if (!email) {
      return res.status(401).send('Unauthenticated');
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: 'Please enter your correct old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(confirmPassword, salt);
    existingUser.password = hash;
    existingUser.save();

    await mailgun.sendEmail(existingUser.email, 'reset-confirmation');

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force'
  }),
  (req,res)=>{
    console.log(res)
  }
  
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id
    };
    console.log("res",res)
    jwt.sign(payload, secret, { expiresIn: tokenLife }, (err, token) => {

      const jwt = `Bearer ${token}`;
      // TODO duplicate variable name. variable name conflict with module instance
      console.log("token",token)
      const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // Save JWT to localStorage
        window.localStorage.setItem('token', '${jwt}');
        // Redirect browser to root of application
        window.location.href = 'http://localhost:8080/auth/success';
      </script>
    </html>       
    `;

      res.send(htmlWithEmbeddedJWT);
    });
  }
);

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: ['public_profile', 'email']
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/',
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id
    };

    jwt.sign(payload, secret, { expiresIn: tokenLife }, (err, token) => {
      const jwt = `Bearer ${token}`;

      const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // Save JWT to localStorage
        window.localStorage.setItem('token', '${jwt}');
        // Redirect browser to root of application
        window.location.href = '/auth/success';
      </script>
    </html>       
    `;

      res.send(htmlWithEmbeddedJWT);
    });
  }
);

module.exports = router;

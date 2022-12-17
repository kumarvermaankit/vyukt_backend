const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
const credentials = require('../credentials.json');
const tokens = require('../token.json');
const getAccessToken = require("../controllers/getaccesstoken")



// async function fetchaccesstoken(client_id,client_secret,refresh_token){
//   let tokenDetails = await fetch("https://accounts.google.com/o/oauth2/token", {
//     "method": "POST",
//     "body": JSON.stringify({
//         "client_id": client_id,
//         "client_secret": client_secret,
//         "refresh_token": refresh_token,
//         "grant_type": "refresh_token",
//     })
// });
// tokenDetails = await tokenDetails.json();
// console.log("tokenDetails");
// console.log(JSON.stringify(tokenDetails,null,2));  // => Complete Response
// const accessToken = tokenDetails.access_token;
// return accessToken
// }


const getGmailService = async () => {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const tkn = await getAccessToken(client_secret,client_id,tokens.refresh_token)
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  console.log(tkn)
  tokens.access_token = tkn
  oAuth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  return gmail;
};

const encodeMessage = (message) => {
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const createMail = async (options) => {
  const mailComposer = new MailComposer(options);
  const message = await mailComposer.compile().build();
  return encodeMessage(message);
};

const sendMail = async (options) => {
  const gmail = await getGmailService();

  const rawMessage = await createMail(options);
  const { data: { id } = {} } = await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: rawMessage,
    },
  });
  return id;
};

module.exports = sendMail;
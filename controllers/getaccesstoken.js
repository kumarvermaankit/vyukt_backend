const axios = require("axios")

const getAccessToken = async (client_id,client_secret,refresh_token) => {
    try {

        // console.log(client_id,client_secret,refresh_token)
        console.log("refresh token = ",refresh_token)
        let tokenDetails = await axios.post("https://oauth2.googleapis.com/token", {
            "client_id": client_id ,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            grant_type: "refresh_token",
        })
        console.log(tokenDetails)
        const accessToken = tokenDetails.data.access_token
        return accessToken
    } catch (error) {
        console.log(error)
        return error
    }

}

module.exports = getAccessToken
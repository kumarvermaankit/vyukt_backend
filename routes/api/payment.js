const express = require("express")
const cors = require("cors")
const Razorpay = require("razorpay")
const request = require("request")
const keys = require("../../keys")

const app = express();
const router = express.Router();
app.use(cors());

// require("dotenv").config();
// import dotenv from "dotenv";
// dotenv.config();


const razorinstance = new Razorpay({
    key_id: keys.razorIdkey,
    key_secret: keys.razorIdSecret,
});

router.get("/order/:money", (req, res) => {
    console.log(req.params.money)
    try {
        const options = {
            amount: Number(req.params.money) * 100,
            currency: "INR",
            receipt: "receipt_#1",
            payment_capture: 0,
        };
        razorinstance.orders.create(options, async (err, order) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: "Somethings Wrong",
                });
            } else {
                return res.status(200).json(order);
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Somethings Error",
        });
    }
});

router.post(
    "/capture/:paymentId/:money",
    (req, res) => {
        try {
            console.log(req.params.money)

            return request(
                {
                    method: "POST",
                    url: `https://${keys.razorIdkey}:${keys.razorIdSecret}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
                    form: {
                        amount: Number(req.params.money) * 100,
                        currency: "INR",
                    },
                },
                async function (err, response, body) {
                    if (err) {
                        return res.status(500).json({
                            message: "Something error!s",
                        });
                    }

                   

                    return res.status(200).json(body);
                }
            );
        } catch (err) {
            console.log(error)
            return res.status(500).json({
                message: err.message,
            });
        }
    }
);

module.exports = router
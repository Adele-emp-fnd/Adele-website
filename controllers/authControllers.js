import bcrypt from "bcrypt";
import db from "../config/db.js";
import sha256 from 'crypto-js/sha256.js';
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();



const saltRount = 10;
var email2 = "";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.ADMIN_ADDRESS,
        pass: process.env.EMAIL_PASS
    }
})

const authControllers = {
    login: async (req, res) => {

        console.log("The login route got hit");
        const { email, password } = req.body;
        console.log(email, password);


        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const checkUser = result.rows;

        console.log("the user id in login is");







        if (checkUser.length == 0) {

            res.status(404).json({ message: "user not registered" });

        } else {
            const checkPassword = await bcrypt.compare(password, checkUser[0].password)

            console.log("result of checked password", checkPassword);

            if (checkPassword === false) {
                res.status(400).json({ message: "incorrect password" })

            } else {
                const userId = checkUser[0].id
                console.log("the user id is", userId);



                const tokentPass = checkUser[0].password
                const token = Math.floor(Math.random() * 400007864897) + tokentPass
                console.log("the created token is: ", token);

                const departmentCheck = await db.query("SELECT department FROM student_registration WHERE id = $1", [userId]);
                const departmentCheckResult = departmentCheck.rows;
                var developer = "";
                if (departmentCheckResult.length > 0) {
                    developer = "MorriscoTech"
                    departmentCheckResult.forEach(item => {
                        console.log("the departmentCheck is", item.department);
                        res.status(200).json({ message: "ok", token: token, userId: userId, department: item.department, developer: developer })


                    })

                } else {
                    res.status(200).json({ message: "ok", token: token, userId: userId })

                }






            }


        }


    },

    register: async (req, res) => {
        const { email, phone, password } = req.body;
        console.log(email);

        const hash = await bcrypt.hash(password, saltRount)

        console.log(hash);
        try {
            const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email])
            console.log("the user already exist", checkUser.rows.length);

            if (checkUser.rows.length < 1) {
                await db.query("INSERT INTO users(email, phone, password) VALUES ($1, $2, $3)", [email, phone, hash])
                res.status(200).json({ message: "ok" })
            } else {
                res.status(400).json({ user: "user already registerd" })
            }

        } catch (error) {
            console.log("internal database error ", error);
            res.status(500).json({ message: error })

        }

        // if (!email && !phone && !password) {
        //     console.log("");


        // }
        //         const newUser = async()=>{
        //             try {

        //             } catch (error) {
        //                 console.log("internal db error ", error);

        //             }

        //         } 








    },

    passwordReset: async (req, res) => {
        console.log("reset password route hitted");
        const email = req.body.email
        console.log(email);

        const userEmail = await db.query("SELECT email FROM users WHERE email = $1", [email]);

        if (userEmail.rows.length <= 0) {
            res.json({ message: "email not registered", exist: false })
        } else {

            const message = email
            const nonce = Math.floor(Math.random(3000) * 20000)
            const hashDigest = sha256(message).toString();
            console.log("the hashed token is ", hashDigest.slice(0, 6) + nonce);

            const mailOption = {
                from: process.env.ADMIN_ADDRESS,
                to: email,
                subject: "password reset token",
                text: `copy this token and paste it in the token field if you want to reset your password \n \n ${hashDigest.slice(0, 6) + nonce}`

            };

            transporter.sendMail(mailOption, async (error, info) => {
                if (error) {
                    return res.status(500).json({ message: "failed to send email", exist: true })

                    console.log("error sending email:", error);

                } else {
                    console.log("success", info.response);
                    res.status(200).json({ message: "email sent successfully", exist: true })

                    var resetToken = hashDigest.slice(0, 6) + nonce;
                    await db.query("UPDATE users SET reset_token = $1 WHERE email = $2", [resetToken, email])

                }
            })



            email2 = email
            console.log("email2 is: ", email2);

        }


    },

    passwordResetToken: async (req, res) => {
        console.log("passwordResetToken hitted");

        const { email, token } = req.body;

        const checkToken = await db.query("SELECT reset_token FROM users WHERE email= $1", [email])
        const dbToken = checkToken.rows[0].reset_token;
        console.log("the db token is", dbToken);
        if (token === dbToken) {
            res.status(200).json({ message: "token Confirmed", confirm: true })
        } else {
            res.status(200).json({ message: "token mismatch", confirm: false })

        }



    },

    passwordReseted: async (req, res) => {
        try {
            const { reset, password } = req.headers
            var email = email2
            console.log("reseted rout got hitted: ", reset, password, email);

            const hash = await bcrypt.hash(password, saltRount)
            console.log("the encrypted password is: ", hash);


            if (reset === "true") {
                const newPass = await db.query("UPDATE users SET password = $1 WHERE email = $2", [hash, email])
                res.json({ message: "updated" })
            }

        } catch (error) {
            console.log("internal database error :", error);

        }


    }
};


export default authControllers
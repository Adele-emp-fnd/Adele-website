import db from "../config/db.js";

const adminController = {
    manageUser:async (req, res)=>{
        console.log("manage user route hitted");

        const users = await db.query("SELECT email, phone FROM users");

        const availableUsers = users.rows;

        if (availableUsers.length <= 0) {
            console.log("no user registered");
            res.status(500)
            
            
        }else{
            res.status(200).json({users:availableUsers, message: "ok"})
            console.log(users.rows);

        }
        
        

        
    }
}


export default adminController;
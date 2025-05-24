import { object, string, ValidationError } from "yup";



const userSchema = object({ 
    username: string().email().required(),
    password: string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .required("Password is required"),
})


const signUpValidationInput = async (req, res, next) => {

    try{
       await userSchema.validate(req.body, {abortEarly: false});
       next();


    }catch(error){

        if (error instanceof ValidationError) {
            
            res.status(400).json({message: "validation error", error: error.errors});
               
        }

        console.log("Something went wrong, please check validation middleware");
        

    }

}


export default signUpValidationInput;
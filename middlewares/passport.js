import {object, string, ValidationError} from "yup"

const userSchema = object({
    email: string().required(),
    password: string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .required("Password is required"),
});

const authValidation = (req, res, next) => {
    try {
        userSchema.validate(req.body, {abortEarly: false})
        next()
    } catch (error) {
        if(error instanceof ValidationError){
            console.log("middleware error", error);
        }
        console.log("something went wrong");
            
    }
}

export default authValidation
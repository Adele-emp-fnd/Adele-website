import { object, string, ValidationError } from "yup";

const passwordSchema = object({
   password: string().required("password is required")
   .min(8, "password must be at least 8 characters long")
   .matches(/[A-Z]/, "password must contain capital laters")
   .matches(/[a-z]/, "password must contain small laters")
   .matches(/\d/, "password must contain number")
});

const resetValidate = (req, res, next)=>{
    try {
        passwordSchema.validate(req.body, {abortEarly:false})
        console.log("password from middleware: ", req.body.password);
        
        next()
        
    } catch (error) {
        if (error instanceof ValidationError) {
            console.log("middleware error: ", error);
            res.json({message:error})
            
        }else{
            console.log("something went wrong");
            
        }
    }

}

export default resetValidate;
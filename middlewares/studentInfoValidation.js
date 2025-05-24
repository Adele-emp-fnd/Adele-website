import { object, string, number, ValidationError } from "yup";



const userSchema = object({
    firstName: string().min(3, "First Name must more than two Characters").max(45, 'First Name must not be more than 45 characters').required(),
    SurName: string().min(3, "Surname must more than two Characters").max(45, 'Last Name must not be more than 45 characters').required(),
    otherName: string().min(3, "Other name must more than two Characters").max(45, 'Other name must not be more than 45 characters').required(),
    gender: string().max(1, 'Gender must not be more than 1 character e.g m or f').required(),
    dateOfBirth: string().required(),
    email: string().email().required(),
    phone: number().integer().max(13, "Phone number must not be more than 13 numbers").positive().required(),
    address: string().required().max(100, "You have exceeded the number of charaters of address"),
    lga: string().required(),
    state: string().required(),
    country: string().required(),
    qualification: string().required()

    
})


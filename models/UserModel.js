//import { genSalt, hash } from "bcryptjs";
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
     email: {
        type: String,
        required:[true, "Email is Required"],
        unique: true,
     },
     password: {
        type: String,
        required:[true, "Password is Required"]
     },
     firstName: {
        type: String,
        required:false
     },
     lastName: {
        type: String,
        required:false
     },
     image: {
        type: String,
        required:false
     },
     color: {
        type: String,
        required:false
     },
     profileSetup: {
        type: Boolean,
        default: false
     },
},{timestamps: true});



userSchema.pre("save", async function (next) {
    try {
        // Generate a salt with default salt rounds (10)
        const salt = await bcrypt.genSalt();
        // Hash the password using the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Pass any errors to the next middleware
    }
});


const User = mongoose.model("User", userSchema);

export default User;

// userSchema.pre("save", async function (next) {
//    const salt = await genSalt();
//    this.password = await hash(this.password,salt);
//    next();
// });
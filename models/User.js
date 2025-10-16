
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    isAdmin: {type: Boolean, default: false} // Add this line
})

const User = mongoose.model('User', userSchema)

export default User;
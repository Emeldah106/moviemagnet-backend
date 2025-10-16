
import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true, ref: 'User' },
    show: { type: String, required: true, ref: 'Show' },
    amount: { type: Number, required: true },
    bookedSeats: { type: Array, required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
    paymentIntentId: { type: String }, // Add this line
    stripeSessionId: { type: String },  // ADD THIS LINE
    paidAt: { type: Date }  // ADD THIS LINE
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
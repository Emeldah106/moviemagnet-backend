import Stripe from "stripe";
import Booking from '../models/Booking.js';
import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error("Webhook signature verification failed:", error.message);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                // This is the event that fires when payment is successful
                const session = event.data.object;
                const { bookingId } = session.metadata;

                console.log("Payment successful for booking:", bookingId);

                // Update booking to paid status
                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: "",
                    paidAt: new Date()
                });

                console.log("Booking updated successfully");

                // Send confirmation email
                await inngest.send({
                    name: "app/show.booked",
                    data: { bookingId }
                });

                console.log("Confirmation email queued");
                break;
            }

            case "payment_intent.succeeded": {
                // Keep this as a backup
                const paymentIntent = event.data.object;
                console.log("Payment intent succeeded:", paymentIntent.id);
                
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                });

                if (sessionList.data.length > 0) {
                    const session = sessionList.data[0];
                    const { bookingId } = session.metadata;

                    await Booking.findByIdAndUpdate(bookingId, {
                        isPaid: true,
                        paymentLink: "",
                        paidAt: new Date()
                    });

                    // Send confirmation email
                    await inngest.send({
                        name: "app/show.booked",
                        data: { bookingId }
                    });
                }
                break;
            }

            case "checkout.session.expired": {
                // Handle expired sessions
                const session = event.data.object;
                const { bookingId } = session.metadata;
                console.log("Checkout session expired for booking:", bookingId);
                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
        }
        
        response.json({ received: true });

    } catch (err) {
        console.error("Webhook processing error:", err);
        response.status(500).send("Internal Server Error");
    }
}

import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream'
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer (readable:Readable){
    const chunks = []

    for await (const chunk of readable){
        chunks.push(
            typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        )
    }

    return Buffer.concat(chunks)
}

export const config = {
    api:{
        bodyParser: false
    }
}

const relevantEvents = new Set([
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
]);

export default async function (req: NextApiRequest, res: NextApiResponse){
    if(req.method === 'POST'){
        const buff = await buffer(req)
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(buff, secret, process.env.STRIPE_WEBHOOK_SECRET)
        } catch (error) {
            return res.status(400).send(`Webhook error: ${error.message}`)
        }

        const {type} = event
        if(relevantEvents.has(type)){
            try {
                switch (type) {
                    case 'checkout.session.completed':
                        const checkouSession = event.data.object as Stripe.Checkout.Session
                        await saveSubscription(
                            checkouSession.subscription.toString(),
                            checkouSession.customer.toString(),
                            true
                        )
                        break;
                    case "customer.subscription.updated":
                    case "customer.subscription.deleted":
                        const subscription = event.data.object as Stripe.Subscription
                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            false
                        )
                        break
                    default:
                        throw new Error("Unhandled event");
                        break;
                }
            } catch (error) {
                // sentry, bugsnatch
                return res.json({error:'Webhook handler failed.'})
            }
            
        }
        res.json({received:true})
    }else{
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}
import { auth, currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils'

const settingsUrl = absoluteUrl("/settings")

export async function GET() {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if(!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userSubscription = await prismadb.userSubscription.findUnique({
            where: {
                userId
            }
        });

        //either doing billing portal or checkout session, one cancels or upgrades sub, other creates for the very first time
        if(userSubscription && userSubscription.stripeCustomerId){
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: settingsUrl,
            });

            return new NextResponse(JSON.stringify({ url: stripeSession.url }));
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "Smart Gai Pro",
                            description: "Unlimited AI Generations",
                        },
                        unit_amount: 2000,
                        recurring: {
                            interval: "month"
                        }
                    },
                    quantity: 1,
                }
            ],
            //need metadata because this doesnt create anything, just opens the checkout page, but once the user enters their CC information and purchases we create a webhook which will catch that and read the metadata, find the userID, and connect the checkout to the correct user. Otherwise users could checkout and use the app but we wouldn't know which user to connect the sub to
            metadata: {
                userId,
            },
        })

        return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    } catch (error) {
        console.log("[STRIPE_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}
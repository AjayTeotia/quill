"use client"

import { getUserSubscriptionPlan } from "@/lib/stripe"
import { MaxWidthWrapper } from "../common/max-width-wrapper"
import { trpc } from "@/app/_trpc/client"
import { toast } from "sonner"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Loader2Icon } from "lucide-react"
import { format } from "date-fns"

interface props {
    subscriptionPlan: Awaited<
        ReturnType<typeof getUserSubscriptionPlan>
    >
}

export const BillingForm = ({
    subscriptionPlan
}: props) => {
    const {
        mutate: createStripeSession,
        status,
    } = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            if (url) {
                window.location.href = url;
            } else {
                toast.error("There was a problem...", {
                    description: "Please try again later",
                });
            }
        },
    });

    const isLoading = status === "pending";

    return (
        <MaxWidthWrapper className="max-w-5xl">
            <form
                className="mt-12"
                onSubmit={(e) => {
                    e.preventDefault()
                    createStripeSession()
                }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>
                            You are currently on the{" "}
                            <strong>{subscriptionPlan?.name}</strong> plan
                        </CardDescription>
                    </CardHeader>

                    <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                        <Button type="submit">
                            {isLoading ? (
                                <Loader2Icon className="mr-4 size-4 animate-spin" />
                            ) : null}

                            {subscriptionPlan.isSubscribed
                                ? "Manage Subscription"
                                : "Upgrade to PRO"
                            }
                        </Button>

                        {subscriptionPlan.isSubscribed ? (
                            <p className="rounded-full text-xs font-medium">
                                {subscriptionPlan.isCanceled
                                    ? "Your plan will be canceled on"
                                    : "Your plan renews on"}
                                {format(
                                    subscriptionPlan.stripeCurrentPeriodEnd!,
                                    "MMM dd, yyyy"
                                )}
                                .
                            </p>
                        ) : null}
                    </CardFooter>
                </Card>
            </form>
        </MaxWidthWrapper>
    )
}
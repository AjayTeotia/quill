"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "../ui/button"
import { trpc } from "@/app/_trpc/client"

export const UpgradeButton = () => {
    const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            window.location.href = url ?? "/dashboard/billing"
        }
    })

    return (
        <Button className="w-full" onClick={() => createStripeSession()}>
            Upgrade now
            <ArrowRightIcon className="ml-1.5 size-5" />
        </Button>
    )
}
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { useState, useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import { trpc } from "@/app/_trpc/client"

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')
    const [unauthorized, setUnauthorized] = useState(false)

    const { data, error, isSuccess, isError } = trpc.authCallback.useQuery()

    useEffect(() => {
        if (isSuccess && data?.success) {
            router.push(origin ? `/${origin}` : "/dashboard")
        }
    }, [isSuccess, data, origin, router])

    useEffect(() => {
        if (isError && error?.data?.code === "UNAUTHORIZED") {
            setUnauthorized(true)
        }
    }, [isError, error])

    if (unauthorized) {
        return (
            <div className="w-full mt-24 flex justify-center">
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-semibold text-xl text-red-600">
                        You&apos;re not authorized.
                    </h3>
                    <p>Please sign in again to continue.</p>
                    <div className="flex items-center gap-2">
                        <LoginLink
                            className={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            })}
                        >
                            Sign In
                        </LoginLink>
                        <RegisterLink
                            className={buttonVariants({ size: "sm" })}
                        >
                            Get Started{" "}
                            <ArrowRightIcon className="ml-1.5 size-5" />
                        </RegisterLink>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full mt-24 flex justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2Icon className="size-8 animate-spin text-zinc-800" />
                <h3 className="font-semibold text-xl">
                    Setting up your account...
                </h3>
                <p>You will be redirected automatically.</p>
            </div>
        </div>
    )
}

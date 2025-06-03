import AuthCallback from "@/components/auth-callback/auth-callback"
import { Suspense } from "react"

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading auth...</div>}>
            <AuthCallback />
        </Suspense>
    )
}

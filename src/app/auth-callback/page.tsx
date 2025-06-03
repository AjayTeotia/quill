"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    
    return (
        <div>
            <h1>Auth Callback</h1>
        </div>
    )
} 
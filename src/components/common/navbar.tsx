import Link from "next/link"
import { MaxWidthWrapper } from "./max-width-wrapper"
import { getKindeServerSession, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { buttonVariants } from "../ui/button"
import { ArrowRightIcon } from "lucide-react"
import { MobileNav } from "./mobile-nav"
import { UserAccountNav } from "./user-account-nav"

export const Navbar = async () => {
    const { getUser } = await getKindeServerSession()
    const user = await getUser()

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link
                        href="/"
                        className="flex z-40 font-semibold"
                    >
                        quill.
                    </Link>

                    {/* Mobile Nav */}
                    <MobileNav isAuth={!!user} />

                    <div className="hidden items-center space-x-4 sm:flex">
                        {!user ? (
                            <>
                                {/* Pricing link */}
                                <Link
                                    href="/pricing"
                                    className={buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    })}
                                >
                                    Pricing
                                </Link>

                                {/* Sign In Link */}
                                <LoginLink
                                    className={buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    })}
                                >
                                    Sign In
                                </LoginLink>

                                {/* Register link */}
                                <RegisterLink
                                    className={buttonVariants({
                                        size: "sm",
                                    })}
                                >
                                    Get Started{" "}
                                    <ArrowRightIcon className="ml-1.5 size-5" />
                                </RegisterLink>
                            </>
                        ) : (
                            <>
                                {/* Dashboard link */}
                                <Link
                                    href="/dashboard"
                                    className={buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    })}
                                >
                                    Dashboard
                                </Link>

                                {/* User account nav */}
                                <UserAccountNav
                                    name={
                                        !user.given_name || !user.family_name
                                            ? "Your Account"
                                            : `${user.given_name} ${user.family_name}`
                                    }
                                    email={user.email ?? ""}
                                    imageUrl={user.picture ?? ""}
                                />
                            </>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav >
    )
}
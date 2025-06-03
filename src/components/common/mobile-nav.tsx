"use client";

import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "../ui/button";
import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";

export const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleMenu = () => setIsOpen((prev) => !prev);

    const closeOnCurrent = (href: string) => {
        if (pathname === href) {
            setIsOpen(false);
        }
    }

    return (
        <div className="sm:hidden">
            {/* Mobile Nav Button */}
            {isOpen ? (
                <XIcon onClick={toggleMenu} className="cursor-pointer" />
            ) : (
                <MenuIcon onClick={toggleMenu} className="cursor-pointer" />
            )}

            {/* Mobile Nav Menu */}
            {isOpen ? (
                <>
                    <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
                        <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
                            {!isAuth ? (
                                <>
                                    {/* Pricing link */}
                                    <li>
                                        <Link
                                            href="/pricing"
                                            className={buttonVariants({
                                                variant: "ghost",
                                                size: "sm",
                                                className: "font-semibold w-full",
                                            })}
                                            onClick={() => closeOnCurrent("/pricing")}
                                        >
                                            Pricing
                                        </Link>
                                    </li>

                                    <li className="my-3 h-px w-full bg-gray-300" />

                                    {/* Sign In Link */}
                                    <li>
                                        <LoginLink
                                            className={buttonVariants({
                                                variant: "ghost",
                                                size: "sm",
                                                className: "font-semibold w-full",
                                            })}
                                        >
                                            Sign In
                                        </LoginLink>
                                    </li>

                                    <li className="my-3 h-px w-full bg-gray-300" />

                                    {/* Register link */}
                                    <li>
                                        <RegisterLink
                                            className={buttonVariants({
                                                size: "sm",
                                                className: "font-semibold w-full",
                                            })}
                                        >
                                            Get Started{" "}
                                            <ArrowRightIcon className="ml-1.5 size-5" />
                                        </RegisterLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {/* Dashboard link */}
                                    <li>
                                        <Link
                                            href="/dashboard"
                                            className={buttonVariants({
                                                variant: "ghost",
                                                size: "sm",
                                                className: "font-semibold w-full",
                                            })}
                                            onClick={() => closeOnCurrent("/dashboard")}
                                        >
                                            Dashboard
                                        </Link>
                                    </li>

                                    <li className="my-3 h-px w-full bg-gray-300" />

                                    <li>
                                        <LogoutLink
                                            className={buttonVariants({
                                                variant: "destructive",
                                                size: "sm",
                                                className: "font-semibold w-full",
                                            })}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Logout
                                        </LogoutLink>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </>
            ) : null}
        </div>
    );
};

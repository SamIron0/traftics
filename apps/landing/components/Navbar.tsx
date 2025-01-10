'use client'
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-text.svg"
                alt="Traftics Logo"
                width={110}
                height={124}
                className="rounded-lg"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-md md:flex md:items-center md:gap-5">
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="https://traftics-docs.ironkwe.site/"
                className=" text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
            </div>
            <Button
              variant="ghost"
              className="text-md h-9 px-4"
              size="sm"
              onClick={() => router.push("https://traftics.ironkwe.site/login")}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="bg-zinc-900 text-zinc-50 text-md h-9 px-4"
              onClick={() => router.push("https://traftics.ironkwe.site/login")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-text.svg"
                alt="Traftics Logo"
                width={100}
                height={12}
                className="rounded-lg"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Links */}
            <div className="hidden md:flex md:items-center md:gap-5">
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
            </div>
            <Button
              variant="ghost"
              className="text-sm h-9 px-4"
              size="sm"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-zinc-900 text-zinc-50 text-sm h-9 px-4"
              asChild
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

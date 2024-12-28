import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin } from "lucide-react";

const productLinks = [
  { name: "Pricing", href: "/pricing" },
  { name: "Documentation", href: "/docs" },
];

const companyLinks = [
  { name: "About", href: "https://www.linkedin.com/company/traftics/" },
  { name: "Contact", href: "/contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  {
    name: "X",
    href: "https://twitter.com/traftics",
    icon: Twitter,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/traftics",
    icon: Linkedin,
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-text.svg"
                alt="Traftics Logo"
                width={120}
                height={14}
                className="rounded-lg"
              />
            </Link>
            <p className="text-md text-muted-foreground max-w-xs">
              Powerful analytics and user behavior insights to help you make data-driven decisions.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-md font-medium mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-md font-medium mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-md font-medium mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-md text-muted-foreground text-center">
            © {new Date().getFullYear()} Traftics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
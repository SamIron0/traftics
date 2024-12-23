import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
    </>
  );
} 
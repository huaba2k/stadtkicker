// app/(website)/layout.tsx
import Navbar from "../../components/Navbar"; // Oder NavbarInternal
import Footer from "../../components/Footer";
// ... imports

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // KEIN <html> oder <body> hier! Nur ein div oder fragment.
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
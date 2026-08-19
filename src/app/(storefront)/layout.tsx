import TopBar from "@/components/TopBar";
import MainHeader from "@/components/MainHeader";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 flex flex-col pb-[72px] lg:pb-0">
      <TopBar />
      <MainHeader />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Newsletter />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

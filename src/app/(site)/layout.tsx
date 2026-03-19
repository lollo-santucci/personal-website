import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageEntrance from '@/components/PageEntrance';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="flex-grow pt-4 pb-8 md:pt-6 md:pb-12"
      >
        <PageEntrance>{children}</PageEntrance>
      </main>
      <Footer />
    </>
  );
}

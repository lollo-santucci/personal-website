import Footer from '@/components/Footer';
import PageEntrance from '@/components/PageEntrance';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main id="main-content" className="flex-grow">
        <PageEntrance>{children}</PageEntrance>
      </main>
      <Footer />
    </>
  );
}

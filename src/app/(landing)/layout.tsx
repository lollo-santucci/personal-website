export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main id="main-content" className="h-[100dvh]">
      {children}
    </main>
  );
}

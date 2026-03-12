import HeaderNav from '@/components/HeaderNav';

export default function Header() {
  return (
    <header className="relative border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
        <a href="/" className="text-lg font-semibold text-gray-900">
          Lorenzo Santucci
        </a>
        <HeaderNav />
      </div>
    </header>
  );
}

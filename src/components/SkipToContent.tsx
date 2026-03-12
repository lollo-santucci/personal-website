export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
    >
      Skip to content
    </a>
  );
}

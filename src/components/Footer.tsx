export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 px-4 text-center text-sm text-gray-600">
      <p>© {new Date().getFullYear()} Lorenzo Santucci</p>
      <div className="mt-2 flex justify-center gap-4">
        <a
          href="https://github.com/lollo-santucci"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 underline-offset-2 hover:underline"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/lorenzosantucci"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 underline-offset-2 hover:underline"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}

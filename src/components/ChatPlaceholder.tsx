export default function ChatPlaceholder() {
  return (
    <button
      aria-disabled="true"
      aria-label="Start Chat — Coming Soon"
      className="inline-flex flex-col items-center gap-1 rounded-lg bg-gray-100 px-6 py-3 text-gray-400 pointer-events-none"
    >
      <span className="text-sm font-medium">Start Chat</span>
      <span className="text-xs">Coming Soon</span>
    </button>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-10">
      <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-gray-500 flex justify-between">
        <span>© {new Date().getFullYear()} SOLCLASSIS. All rights reserved.</span>
        <span>Built by Minji on Solana devnet</span>
      </div>
    </footer>
  );
}
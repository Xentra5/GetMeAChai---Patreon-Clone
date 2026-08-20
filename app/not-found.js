import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-6 text-3xl">
        ☕
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">404 - Page Not Found</h1>
      <p className="text-gray-400 max-w-md mb-8 text-base sm:text-lg">
        Oops! The page or creator profile you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
      >
        Return to Home
      </Link>
    </div>
  );
}

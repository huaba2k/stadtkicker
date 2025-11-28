import Link from "next/link";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center px-4">
      <div className="w-16 h-16 bg-primary-100 dark:bg-slate-800 text-primary-600 rounded-full flex items-center justify-center mb-6 text-3xl">
        🚧
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        An dieser Seite arbeiten wir gerade noch. Schau bald wieder vorbei!
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Zurück zur Startseite
      </Link>
    </div>
  );
}
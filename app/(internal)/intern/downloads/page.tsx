import { client } from "../../../../sanity/client";

// 1. Typ-Definition (Behebt Fehler: "DownloadItem wurde nicht gefunden")
type DownloadItem = {
_id: string;
title: string;
category: string;
description?: string;
fileUrl: string;
extension: string;
size: number;
};

// 2. Daten von Sanity holen
async function getDownloads() {
// WICHTIG: Hier haben die schrägen Anführungszeichen (Backticks) gefehlt!
// Der Query muss grün leuchten und in ... stehen.
const query = '*[_type == "download"] | order(title asc) { _id, title, category, description, "fileUrl": file.asset->url, "extension": file.asset->extension, "size": file.asset->size }';

// Kein revalidate: 0 für den Export!
return client.fetch(query);
}

// Helper für Dateigröße (Bytes -> MB)
function formatSize(bytes: number) {
if (bytes === 0) return '0 Bytes';
const k = 1024;
const sizes = ['Bytes', 'KB', 'MB', 'GB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default async function DownloadsPage() {
// Wir sagen TS, dass das Ergebnis ein Array von DownloadItems ist
const downloads: DownloadItem[] = await getDownloads();

const categories = {
general: "Satzung & Allgemeines",
forms: "Formulare & Anträge",
archive: "Chronik & Geschichte"
};

// Gruppieren
// Behebt Fehler: "Parameter 'item' weist implizit einen Typ 'any' auf"
const groupedDownloads = downloads.reduce((acc, item: DownloadItem) => {
const cat = item.category || 'general';
if (!acc[cat]) acc[cat] = [];
acc[cat].push(item);
return acc;
}, {} as Record<string, DownloadItem[]>);

return (
<div className="max-w-5xl mx-auto p-4 sm:p-8">
<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Downloads & Dokumente</h1>

  {downloads.length === 0 && (
    <div className="p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <p className="text-slate-500">Aktuell keine Dokumente verfügbar.</p>
    </div>
  )}

  <div className="space-y-12">
    {Object.entries(categories).map(([key, label]) => {
      const items = groupedDownloads[key];
      if (!items || items.length === 0) return null;

      return (
        <div key={key}>
          <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4 uppercase tracking-wider text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
            {label}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <a 
                key={item._id} 
                // Erzwingt Download mit sauberem Namen
                href={`${item.fileUrl}?dl=${item.title.replace(/\s+/g, '-')}.${item.extension}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary-500 transition-all"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-4 text-slate-500 group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                  <span className="font-bold text-xs uppercase">{item.extension}</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {formatSize(item.size)} • Klicken zum Laden
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
    })}
  </div>
</div>


);
}
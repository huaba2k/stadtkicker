import { FaFileAlt, FaDownload } from "react-icons/fa";

type Props = {
  title: string;
  description?: string;
  fileUrl?: string;
  extension?: string;
  size?: number;
};

// Helper für Dateigröße
const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
};

export default function FileDownload({ title, description, fileUrl, extension, size }: Props) {
  if (!fileUrl) return null;

  return (
    <div className="my-8 not-prose">
      <a 
        href={`${fileUrl}?dl=${title}.pdf`} 
        className="group flex items-center p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-500 hover:shadow-md transition-all no-underline"
      >
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            {/* Hier nutzen wir jetzt das vorhandene Icon */}
            <FaFileAlt size={24} />
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-primary-600 transition-colors m-0">
              {title}
            </h4>
            {description && <p className="text-slate-500 text-sm mt-1 m-0">{description}</p>}
            <div className="text-xs text-slate-400 mt-1 font-mono uppercase flex gap-2">
                <span>{extension}</span>
                {size && <span>• {formatSize(size)}</span>}
            </div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
            <FaDownload size={20} />
          </div>
      </a>
    </div>
  );
}
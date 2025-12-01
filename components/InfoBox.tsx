import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

type Props = {
  title?: string;
  text: string;
  type?: 'info' | 'warning' | 'success';
};

export default function InfoBox({ title, text, type = 'info' }: Props) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200",
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  };

  const icons = {
    info: <FaInfoCircle className="w-5 h-5" />,
    warning: <FaExclamationTriangle className="w-5 h-5" />,
    success: <FaCheckCircle className="w-5 h-5" />,
  };

  return (
    <div className={`my-6 p-4 rounded-lg border-l-4 flex gap-4 items-start ${styles[type]}`}>
      <div className="mt-1 flex-shrink-0 opacity-80">{icons[type]}</div>
      <div>
        {title && <h4 className="font-bold text-sm uppercase tracking-wide mb-1 opacity-90">{title}</h4>}
        <p className="text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
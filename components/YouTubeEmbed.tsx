"use client";

export default function YouTubeEmbed({ url, caption }: { url: string; caption?: string }) {
  if (!url) return null;

  // Einfache Logik um die Video-ID aus normalen YouTube-Links zu holen
  let videoId = "";
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regex.exec(url);
  if (match && match[1]) {
    videoId = match[1];
  }

  if (!videoId) return <div className="text-red-500 p-4 border border-red-200 rounded">Ungültige YouTube URL</div>;

  return (
    <div className="my-8 max-w-4xl mx-auto w-full">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={caption || "YouTube video"}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && <p className="text-center text-sm text-slate-500 mt-2 italic">{caption}</p>}
    </div>
  );
}
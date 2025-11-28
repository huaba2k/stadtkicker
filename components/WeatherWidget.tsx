"use client";

import { useEffect, useState } from "react";
import Image from "next/image"; // Wir nutzen Next/Image für bessere Performance

// Fallback Daten
const DEFAULT_WEATHER = { temp: 12, desc: "Heiter", icon: "01d" };

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn("Kein Wetter API Key gefunden. Nutze Mock-Daten.");
      setWeather(DEFAULT_WEATHER);
      setLoading(false);
      return;
    }

    // Koordinaten Garching b. München
    const lat = 48.249;
    const lon = 11.652;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            desc: data.weather[0].description,
            icon: data.weather[0].icon,
          });
        }
      })
      .catch((err) => console.error("Wetter Fehler:", err))
      .finally(() => setLoading(false));
  }, []);

  // Kleiner Platzhalter beim Laden (damit es nicht springt)
  if (loading) {
    return (
      <div className="mt-4 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"></div>
    );
  }

  // Fallback, falls API komplett scheitert
  if (!weather) return null;

  return (
    <div className="mt-4 p-5 rounded-xl shadow-md border border-primary-500/30 text-white bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-between relative overflow-hidden group">
      
      {/* Dekorativer Glanz-Effekt im Hintergrund */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-colors"></div>

      <div className="relative z-10">
        <span className="text-xs font-bold text-primary-100 uppercase tracking-wider mb-1 block">
          Wetter Garching
        </span>
        <div className="text-3xl font-bold text-white tracking-tight">
          {weather.temp}°C
        </div>
        <p className="text-sm text-primary-100 capitalize font-medium mt-0.5">
          {weather.desc}
        </p>
      </div>

      <div className="relative z-10 w-16 h-16 filter drop-shadow-lg">
        <Image 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.desc}
          width={64}
          height={64}
          className="object-contain"
          unoptimized // Wichtig für externe Bilder ohne Domain-Config
        />
      </div>
    </div>
  );
}
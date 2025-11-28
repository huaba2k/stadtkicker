"use client";

import { useState } from "react";

export default function KontaktPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    
    // --- DEIN KEY ---
    formData.append("access_key", "DEIN-ACCESS-KEY-HIER-EINFUEGEN"); 

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: json
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        console.error("API Fehler:", result);
        setStatus("error");
      }
    } catch (error) {
      console.error("Netzwerkfehler:", error);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">Kontakt aufnehmen</h1>
        <p className="text-slate-600 dark:text-slate-300 text-center mb-10">
          Du hast Fragen zum Training, willst Mitglied werden oder uns zu einem Turnier einladen? Schreib uns!
        </p>

        {status === "success" ? (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-8 rounded-xl text-center border border-green-200 dark:border-green-800 shadow-sm">
            <div className="w-16 h-16 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h3 className="font-bold text-2xl mb-2">Nachricht gesendet!</h3>
            <p className="mb-6">Vielen Dank. Wir melden uns so schnell wie möglich bei dir.</p>
            <button 
              onClick={() => setStatus("idle")} 
              className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Neue Nachricht schreiben
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 space-y-6">
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dein Name</label>
              <input type="text" name="name" id="name" required className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deine E-Mail</label>
              <input type="email" name="email" id="email" required className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4" />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Betreff</label>
              <select name="subject" id="subject" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4">
                <option>Allgemeine Anfrage</option>
                <option>Mitgliedschaft</option>
                <option>Turniereinladung</option>
                <option>Stockschützen</option>
                <option>Sonstiges</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nachricht</label>
              <textarea name="message" id="message" rows={5} required className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4"></textarea>
            </div>

            {status === "error" && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center border border-red-100 dark:border-red-800">
                Es gab einen Fehler beim Senden. Bitte versuche es später erneut oder schreibe direkt an info@garchinger-stadtkicker.de
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Wird gesendet..." : "Nachricht absenden"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

export default function KontaktPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    // Wir wandeln FormData in ein normales JSON-Objekt um
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        // Optional: Formular resetten
        (e.target as HTMLFormElement).reset();
      } else {
        console.error("Web3Forms Error:", result);
        setError("Etwas hat nicht geklappt. Bitte versuche es später noch einmal.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("Verbindungsfehler. Bitte prüfe deine Internetverbindung.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            KONTAKT
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Du hast Fragen zur Mitgliedschaft, zum Training, möchtest uns unterstützen oder zu einem Turnier einladen?
            Schreib uns einfach!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Linke Spalte: Infos */}
          <div className="space-y-8">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Deine Ansprechpartner</h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <FaMapMarkerAlt />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">Sportgelände Garmin-Stadion am See</h4>
                         <p className="text-slate-600 dark:text-slate-400">Am See 8<br/>85748 Garching bei München</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <FaEnvelope />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">E-Mail</h4>
                         <a href="mailto:kontakt@garchinger-stadtkicker.de" className="text-primary-600 hover:underline">kontakt@garchinger-stadtkicker.de</a>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Rechte Spalte: Formular */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            
            {/* Access Key für Web3Forms */}
            {/* WICHTIG: Ersetze 'YOUR_ACCESS_KEY' mit deinem echten Key in .env.local oder hier direkt */}
            
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
                    <FaCheckCircle />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nachricht gesendet!</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-8">
                   Vielen Dank für deine Anfrage. Wir melden uns so schnell wie möglich bei dir.
                 </p>
                 <button 
                   onClick={() => setIsSuccess(false)}
                   className="text-primary-600 font-bold hover:underline"
                 >
                   Noch eine Nachricht schreiben
                 </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hidden Fields für Web3Forms Config */}
                <input type="hidden" name="access_key" value="3aa9293e-f0be-4973-a369-f55f9b4a18fb" />
                <input type="hidden" name="subject" value="Neue Nachricht über Website Kontaktformular" />
                <input type="hidden" name="from_name" value="Garchinger Stadtkicker Website" />
                
                {/* Honeypot gegen Spam (wird per CSS versteckt, aber Bots füllen es aus) */}
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                    <input type="text" name="name" required className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Max Mustermann" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">E-Mail</label>
                    <input type="email" name="email" required className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="max@beispiel.de" />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nachricht</label>
                  <textarea name="message" rows={5} required className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Deine Nachricht an uns..."></textarea>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Wird gesendet..."
                  ) : (
                    <>Nachricht absenden <FaPaperPlane /></>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
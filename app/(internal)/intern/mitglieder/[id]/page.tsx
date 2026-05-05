// app/(internal)/intern/mitglieder/[id]/page.tsx
import MemberDetailClient from './MemberDetailClient';
import { createClient } from '@supabase/supabase-js';
import MemberAttendanceHistory from "@/components/MemberAttendanceHistory";

export const dynamicParams = false;

export async function generateStaticParams() {
  console.log("🛠️ START: Generiere statische Pfade für Mitglieder...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // WICHTIG: Wir versuchen zuerst den Service-Key (Admin) zu nehmen
  // Dieser umgeht RLS (Sicherheitsregeln), damit der Build alle IDs sieht.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ FEHLER: Supabase URL oder Key fehlen!");
    return [];
  }

  // Client erstellen
  const supabaseBuildClient = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: members, error } = await supabaseBuildClient
      .from('members')
      .select('id');

    if (error) {
      console.error("❌ Supabase API Fehler:", error.message);
      return [];
    }

    if (!members || members.length === 0) {
      console.warn("⚠️ Immer noch keine Mitglieder gefunden. Prüfe RLS oder Tabelleninhalt!");
      // Falls wirklich leer, geben wir leer zurück - aber meistens liegt es am fehlenden Service Key
      return [];
    }

    console.log(`✅ ${members.length} Mitglieder gefunden. IDs werden generiert.`);

    return members.map((member) => ({
      id: String(member.id),
    }));

  } catch (err) {
    console.error("❌ Unerwarteter Fehler:", err);
    return [];
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      {/* 1. Die Details (Stammdaten, Bearbeiten-Formular) */}
      <MemberDetailClient id={id} />

      {/* 2. Die neue Historie (Anwesenheitstabelle) darunter */}
      <MemberAttendanceHistory memberId={id} />
    </div>
  );
}
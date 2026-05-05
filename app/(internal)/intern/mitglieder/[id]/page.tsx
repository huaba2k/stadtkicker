// app/(internal)/intern/mitglieder/[id]/page.tsx
import { supabase } from "@/lib/supabase";
import MemberDetailClient from "./MemberDetailClient";

// Diese Funktion MUSS exportiert werden und darf NUR hier stehen
export async function generateStaticParams() {
  try {
    const { data: members } = await supabase.from('members').select('id');
    if (!members) return [];
    return members.map((member) => ({
      id: member.id.toString(), // ID sicherheitshalber als String
    }));
  } catch (e) {
    console.error("Build Error generateStaticParams:", e);
    return [];
  }
}

// Die Server-Page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <MemberDetailClient id={resolvedParams.id} />;
}

import { supabase } from "@/lib/supabase";
import MemberDetailClient from "./MemberDetailClient";

// 1. Hier darf generateStaticParams stehen, da dies eine Server-Komponente ist
export async function generateStaticParams() {
  const { data: members } = await supabase.from('members').select('id');
  return members?.map((member) => ({
    id: member.id,
  })) || [];
}

// 2. Die Page reicht die Params einfach an die Client-Komponente weiter
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <MemberDetailClient id={resolvedParams.id} />;
}

// app/(internal)/intern/mitglieder/[id]/layout.tsx
import { supabase } from "@/lib/supabase";

export async function generateStaticParams() {
  const { data: members } = await supabase.from('members').select('id');
  return members?.map((member) => ({
    id: member.id,
  })) || [];
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import { createClient } from "@/lib/supabase";

export async function saveToVault(generationId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("vault_items")
    .insert([
      {
        user_id: user.id,
        generation_id: generationId,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Already saved in vault.");
    }
    throw new Error(error.message);
  }

  return data;
}
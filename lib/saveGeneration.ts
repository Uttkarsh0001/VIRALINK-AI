import { createClient } from "@/lib/supabase";

type SaveGenerationPayload = {
  tool: string;
  niche: string;
  topic: string;
  style: string;
  platform: string;
  preview: string;
  output_json: any;
};

export async function saveGeneration(payload: SaveGenerationPayload) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("generations")
    .insert([
      {
        user_id: user.id,
        ...payload,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLOUDINARY_CLOUD = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
const CLOUDINARY_KEY = Deno.env.get("CLOUDINARY_API_KEY")!;
const CLOUDINARY_SECRET = Deno.env.get("CLOUDINARY_API_SECRET")!;

async function deleteFromCloudinary(publicId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const str = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_SECRET}`;
  const hashBuffer = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", CLOUDINARY_KEY);
  form.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/destroy`, {
    method: "POST",
    body: form,
  });
}

Deno.serve(async (req) => {
  const { uid, orphanedIds } = await req.json();
  if (!uid || !Array.isArray(orphanedIds)) {
    return new Response("Bad request", { status: 400 });
  }

  await Promise.allSettled(orphanedIds.map(deleteFromCloudinary));
  return new Response(JSON.stringify({ deleted: orphanedIds.length }), {
    headers: { "Content-Type": "application/json" },
  });
});

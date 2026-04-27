import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const filePath = req.nextUrl.searchParams.get("file_path");

  if (!filePath) {
    return NextResponse.json({ error: "file_path required" }, { status: 400 });
  }
  // Path-traversal guard: file must live under the project's prefix.
  if (filePath.includes("..") || !filePath.startsWith(`${id}/`)) {
    return NextResponse.json({ error: "invalid file_path" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.storage
    .from("project-docs")
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "could not create signed url" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}

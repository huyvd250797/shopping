"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 6 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type Props = {
  bannerId: string;
  currentStoragePath: string | null;
};

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

async function validSignature(file: File) {
  const buffer = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (file.type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => buffer[i] === v);
  const text = new TextDecoder("ascii").decode(buffer);
  if (file.type === "image/webp") return text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  if (file.type === "image/gif") return text.startsWith("GIF87a") || text.startsWith("GIF89a");
  return false;
}

export function BannerImageUploader({ bannerId, currentStoragePath }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const file = inputRef.current?.files?.[0];
    if (!file) return setError("Hãy chọn một ảnh banner.");
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) return setError("Ảnh phải là JPG/PNG/WEBP/GIF và tối đa 6MB.");
    if (!(await validSignature(file))) return setError("File không đúng định dạng ảnh.");

    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Phiên Admin đã hết hạn.");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "admin") throw new Error("Tài khoản không có quyền Admin.");

      const path = `banners/${bannerId}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error: uploadError } = await supabase.storage.from("site-media").upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrl } = supabase.storage.from("site-media").getPublicUrl(path);
      const { error: updateError } = await supabase.from("banners").update({ image_url: publicUrl.publicUrl, storage_path: path }).eq("id", bannerId);
      if (updateError) {
        await supabase.storage.from("site-media").remove([path]);
        throw new Error("Không thể gắn ảnh vào banner.");
      }
      if (currentStoragePath) await supabase.storage.from("site-media").remove([currentStoragePath]);

      if (inputRef.current) inputRef.current.value = "";
      setMessage("Đã cập nhật ảnh banner.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload banner thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={upload} className="banner-upload-form">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} />
      <button className="admin-small-button" type="submit" disabled={busy}>{busy ? "Đang upload..." : "Upload ảnh"}</button>
      {message && <span className="banner-upload-ok">{message}</span>}
      {error && <span className="banner-upload-error">{error}</span>}
    </form>
  );
}

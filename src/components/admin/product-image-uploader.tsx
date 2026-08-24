"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/catalog/format";
import { createClient } from "@/lib/supabase/client";
import { finalizeProductImageUpload } from "@/app/admin/(protected)/catalog-actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 6;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type Props = {
  productId: string;
  productName: string;
  hasThumbnail: boolean;
};

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

async function matchesImageSignature(file: File) {
  const buffer = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (file.type === "image/png") return buffer.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => buffer[index] === value);
  if (file.type === "image/webp") {
    const text = new TextDecoder("ascii").decode(buffer);
    return text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  }
  if (file.type === "image/gif") {
    const text = new TextDecoder("ascii").decode(buffer);
    return text.startsWith("GIF87a") || text.startsWith("GIF89a");
  }
  return false;
}

export function ProductImageUploader({ productId, productName, hasThumbnail }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadImages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const files = Array.from(inputRef.current?.files ?? []);
    if (!files.length) return setError("Hãy chọn ít nhất một ảnh.");
    if (files.length > MAX_FILES) return setError("Mỗi lần chỉ được upload tối đa 6 ảnh.");
    if (files.some((file) => file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.has(file.type))) {
      return setError("Ảnh phải là JPG/PNG/WEBP/GIF và tối đa 5MB mỗi ảnh.");
    }

    setBusy(true);
    let uploadedCount = 0;
    try {
      for (const file of files) {
        if (!(await matchesImageSignature(file))) throw new Error(`File ${file.name} không đúng định dạng ảnh.`);
      }

      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Phiên đăng nhập Admin đã hết hạn. Hãy đăng nhập lại.");

      // This check improves UX. Storage/table RLS remains the real authorization boundary.
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "admin") throw new Error("Tài khoản hiện tại không có quyền Admin.");

      const { data: lastImage } = await supabase.from("product_images").select("sort_order").eq("product_id", productId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
      let sortOrder = (lastImage?.sort_order ?? -1) + 1;
      let thumbnailAlreadySet = hasThumbnail;

      for (const file of files) {
        const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "product";
        const path = `${productId}/${Date.now()}-${crypto.randomUUID()}-${base}.${extensionFor(file)}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });
        if (uploadError) throw new Error(`Upload ${file.name} thất bại: ${uploadError.message}`);

        const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
        const imageUrl = publicUrl.publicUrl;
        const { error: rowError } = await supabase.from("product_images").insert({
          product_id: productId,
          image_url: imageUrl,
          storage_path: path,
          alt_text: productName,
          sort_order: sortOrder++,
        });
        if (rowError) {
          await supabase.storage.from("product-images").remove([path]);
          throw new Error(`Không thể ghi gallery cho ${file.name}.`);
        }

        if (!thumbnailAlreadySet) {
          const { error: thumbError } = await supabase.from("products").update({ thumbnail_url: imageUrl, updated_by: user.id }).eq("id", productId);
          if (!thumbError) thumbnailAlreadySet = true;
        }
        uploadedCount += 1;
      }

      await finalizeProductImageUpload(productId, uploadedCount);

      if (inputRef.current) inputRef.current.value = "";
      setMessage(`Đã upload ${uploadedCount} ảnh.`);
      router.refresh();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : "Upload ảnh thất bại.";
      setError(uploadedCount > 0 ? `Đã upload ${uploadedCount} ảnh trước khi gặp lỗi. ${reason}` : reason);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={uploadImages} className="image-upload-form">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={busy} />
        <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Đang upload..." : "Upload ảnh"}</button>
      </form>
      {error && <div className="auth-message error upload-inline-message">{error}</div>}
      {message && <div className="auth-message success upload-inline-message">{message}</div>}
    </div>
  );
}

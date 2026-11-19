"use client";

import { useEffect, useState } from "react";

type Props = { onChange: (file: File | null) => void };

export default function PhotoUploader({ onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-blue/40 bg-brand-white p-6 text-center transition-colors hover:border-brand-green">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Selected photo preview"
          className="max-h-72 w-full rounded-xl object-cover"
        />
      ) : (
        <>
          <span className="text-4xl">📷</span>
          <span className="mt-2 font-semibold text-brand-green">
            Take or choose a photo
          </span>
          <span className="mt-1 text-sm text-slate-500">
            JPG, PNG or WebP, up to 5 MB
          </span>
        </>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={handleFile}
      />
    </label>
  );
}

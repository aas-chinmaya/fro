"use client";

import Upload from "./Upload";

interface Props {
  value?: File | string | null;
  existingImageUrl?: string;
  onChange?: (file: File | null) => void;
  onExistingImageClear?: () => void;
  onError?: (message: string) => void;
  maxSize?: number;
}

export default function ImageUpload({
  value,
  existingImageUrl,
  onChange,
  onExistingImageClear,
  onError,
  maxSize,
}: Props) {
  const uploadValue = value ?? existingImageUrl ?? null;

  const handleChange = (file: File | null) => {
    if (file === null && existingImageUrl && !(value instanceof File)) {
      onExistingImageClear?.();
    }

    onChange?.(file);
  };

  return (
    <Upload
      preview
      value={uploadValue}
      onChange={handleChange}
      onError={onError}
      maxSize={maxSize}
      accept={{
        "image/*": [],
      }}
    />
  );
}
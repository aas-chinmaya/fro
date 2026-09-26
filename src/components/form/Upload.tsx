"use client";

import { UploadCloud, X, FileText } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

interface UploadProps {
  value?: File | string | null;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  preview?: boolean;
  onChange?: (file: File | null) => void;
  onError?: (message: string) => void;
}

export default function Upload({
  value,
  accept,
  maxSize = 5 * 1024 * 1024,
  disabled,
  preview = false,
  onChange,
  onError,
}: UploadProps) {
  const objectUrlRef = useRef<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange?.(acceptedFiles[0] ?? null);
    },
    [onChange]
  );

  const previewSrc = (() => {
    if (value instanceof File) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const nextUrl = URL.createObjectURL(value);
      objectUrlRef.current = nextUrl;
      return nextUrl;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    return typeof value === "string" && value ? value : null;
  })();

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (fileRejections) => {
      onError?.(
        fileRejections[0]?.errors[0]?.code === "file-too-large"
          ? `File must be ${(maxSize / 1024).toFixed(0)} KB or smaller`
          : fileRejections[0]?.errors[0]?.message || "Unable to upload this file"
      );
    },
    accept,
    maxSize,
    disabled,
    multiple: false,
  });

  const fileName = value instanceof File ? value.name : typeof value === "string" ? value.split("/").pop() || "logo" : "";
  const fileSize = value instanceof File ? `${(value.size / 1024).toFixed(1)} KB` : "";

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          rounded-xl
          border-2
          border-dashed
          p-8
          cursor-pointer
          text-center
          transition

          ${
            isDragActive
              ? "border-primary/60 bg-violet-50"
              : "border-gray-300 hover:border-primary/50"
          }
        `}
      >
        <input {...getInputProps()} />

        <UploadCloud
          className="mx-auto mb-4 text-primary"
          size={40}
        />

        <h3 className="font-semibold">Drag & Drop</h3>
        <p className="mt-2 text-sm text-gray-500">or click to browse</p>
      </div>

      {value && (
        <div className="mt-4 flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            {preview && previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt={fileName || "logo preview"}
                width={60}
                height={60}
                className="h-[60px] w-[60px] rounded-lg object-cover"
              />
            ) : (
              <FileText />
            )}

            <div>
              <p className="font-medium">{fileName || "Uploaded file"}</p>
              {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
            </div>
          </div>

          <button type="button" onClick={() => onChange?.(null)}>
            <X />
          </button>
        </div>
      )}
    </div>
  );
}
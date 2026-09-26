"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, Plus, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { UseFormReturn, useFieldArray } from "react-hook-form";

import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";

import { FileUpload, FormField } from "@/components/form";
import { vendorApi } from "@/modules/vendor/api/vendor.api";
import { notify } from "@/lib/toast";
import { useGlobalDocumentTypes } from "@/modules/vendor/masters/hooks/useGlobalDocumentTypes";

interface Props {
  form: UseFormReturn<any>;
}

export default function VendorDocuments({ form }: Props) {
  const router = useRouter();
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const documentErrors = errors.documents as any;
  const documents = watch("documents") as Array<any>;
  const { items: documentTypes } = useGlobalDocumentTypes();

  useEffect(() => {
    documents?.forEach((document, index) => {
      if (document?.globalDocumentTypeID || !document?.documentType) return;

      const legacyType = documentTypes.find(
        (item) => item.id === document.documentType || item.code === document.documentType
      );

      if (legacyType) {
        setValue(`documents.${index}.globalDocumentTypeID`, legacyType.id);
      }
    });
  }, [documents, documentTypes, setValue]);

  const handleFileUpload =
    (index: number) => (file: File | null) => {
      if (!file) {
        setValue(`documents.${index}.file`, undefined);
        setValue(`documents.${index}.fileUrl`, "");
        return;
      }

      setValue(`documents.${index}.file`, file);
      setValue(`documents.${index}.fileUrl`, URL.createObjectURL(file));
    };

  const addDocument = () => {
    append({
      globalDocumentTypeID: "",
      fileUrl: "",
      file: undefined,
    });
  };

  const handleDocumentTypeChange = (index: number, value: string) => {
    const docs = watch("documents") as Array<any>;

    // find existing index with same type
    const existingIndex = docs.findIndex(
      (d: any, i: number) => d?.globalDocumentTypeID === value && i !== index
    );
    if (existingIndex !== -1) {
      // remove previous entry so types remain unique
      remove(existingIndex);
      // if the removed index is before current index, adjusting index required by caller, but setValue will still work
    }

    setValue(`documents.${index}.globalDocumentTypeID`, value);

    const updated = (watch("documents") || [])
      .map((d: any) => d?.globalDocumentTypeID)
      .filter(Boolean);
    setValue("globalDocumentTypeIDs", updated);
  };

  const handleDeleteDocument = async (documentId: string, index: number) => {
    if (!documentId) {
      remove(index);
      return;
    }

    try {
      setDeletingDocumentId(documentId);
      await vendorApi.deleteDocument(documentId);
      notify.success("Document deleted successfully.");
      remove(index);
    } catch (err: any) {
      notify.error(
        err?.response?.data?.message ||
        "Failed to delete document"
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <section className="rounded-3xl bg-rose-50/60 p-1">
      <div className="rounded-[22px] bg-white p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white">
              <Paperclip size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Documents
              </h2>
              <p className="text-sm text-slate-500">
                Certificates and supporting files
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addDocument}
            className="gap-1.5 rounded-xl"
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const document = documents?.[index] ?? {};
            const fieldError = documentErrors?.[index] as any;

            return (
              <div
                key={field.id}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <FormField
                    label="Document Type"
                    error={fieldError?.globalDocumentTypeID?.message}
                  >
                    <Select
                      value={document?.globalDocumentTypeID ?? ""}
                      onValueChange={(value) => {
                        if (value === "__add_document_type__") {
                          router.push("/vendors/masters/document-types");
                          return;
                        }
                        handleDocumentTypeChange(index, value);
                      }}
                    >
                      <SelectTrigger className="rounded-xl bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.filter((item) => item.isActive).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_document_type__" className="border-t border-gray-100 mt-1 font-medium text-primary">
                          <span className="flex items-center gap-2"><Plus className="h-4 w-4" />Add document type</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="File" error={fieldError?.file?.message}>
                    <FileUpload
                      value={document?.file ?? document?.fileUrl ?? null}
                      onChange={handleFileUpload(index)}
                    />
                  </FormField>

                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={deletingDocumentId === document?.id}
                      onClick={() => handleDeleteDocument(document?.id, index)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:text-rose-200"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {document?.fileUrl && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                    <FileText size={14} className="shrink-0 text-rose-500" />
                    <span className="truncate">
                      {documentTypes.find((item) => item.id === document.globalDocumentTypeID)?.name ||
                        "Document ready"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {fields.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 py-12 text-center">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
                <Paperclip size={18} />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No documents yet
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Click Add to attach files
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

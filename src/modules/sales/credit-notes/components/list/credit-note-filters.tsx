"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreditNoteListParams } from "../../types/credit-note.types";
import { REASON_OPTIONS, STATUS_OPTIONS } from "../../utils/credit-note.utils";

interface Props {
  params: CreditNoteListParams;
  onChange: (next: Partial<CreditNoteListParams>) => void;
}

export function CreditNoteFilters({ params, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1 space-y-1">
        <Input
          className="h-9"
          placeholder="Search number, customer, invoice…"
          defaultValue={params.search || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange({ search: (e.target as HTMLInputElement).value.trim() });
            }
          }}
          onBlur={(e) => onChange({ search: e.target.value.trim() })}
        />
      </div>
      <Select
        value={params.status || "all"}
        onValueChange={(v) =>
          onChange({ status: v === "all" ? undefined : (v as CreditNoteListParams["status"]) })
        }
      >
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={params.reason || "all"}
        onValueChange={(v) =>
          onChange({ reason: v === "all" ? undefined : (v as CreditNoteListParams["reason"]) })
        }
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Reason" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reasons</SelectItem>
          {REASON_OPTIONS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

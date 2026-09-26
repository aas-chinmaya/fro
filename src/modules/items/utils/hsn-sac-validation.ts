import * as XLSX from "xlsx";

export const MAX_HSN_SAC_FILE_SIZE = 10 * 1024 * 1024;

const requiredColumns = {
  HSN_MSTR: ["HSN_CD", "HSN_Description"],
  SAC_MSTR: ["SAC_CD", "SAC_Description"],
} as const;

export async function validateHsnSacWorkbook(file: File): Promise<string | null> {
  if (!file) return "Please select the official HSN/SAC Excel file.";
  if (!file.name.toLowerCase().endsWith(".xlsx")) return "Only .xlsx Excel files are supported.";
  if (file.size > MAX_HSN_SAC_FILE_SIZE) return "The Excel file must be 10 MB or smaller.";

  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    for (const [sheetName, columns] of Object.entries(requiredColumns)) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return `The required ${sheetName} sheet is missing.`;
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
      const headers = (rows[0] ?? []).map((value) => String(value).trim());
      const missingColumn = columns.find((column) => !headers.includes(column));
      if (missingColumn) return `${sheetName} is missing the required ${missingColumn} column.`;
    }
  } catch {
    return "The selected file is not a readable Excel workbook.";
  }
  return null;
}

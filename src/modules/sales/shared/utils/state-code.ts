export const STATE_CODE_MAP: Record<string, string> = {
  "andhra pradesh": "37",
  "arunachal pradesh": "12",
  assam: "18",
  bihar: "10",
  chhattisgarh: "22",
  goa: "30",
  gujarat: "24",
  haryana: "06",
  "himachal pradesh": "02",
  jharkhand: "20",
  karnataka: "29",
  kerala: "32",
  "madhya pradesh": "23",
  maharashtra: "27",
  manipur: "14",
  meghalaya: "17",
  mizoram: "15",
  nagaland: "13",
  odisha: "21",
  punjab: "03",
  rajasthan: "08",
  sikkim: "11",
  "tamil nadu": "33",
  telangana: "36",
  tripura: "16",
  "uttar pradesh": "09",
  uttarakhand: "05",
  "west bengal": "19",
  "andaman and nicobar islands": "35",
  chandigarh: "04",
  "dadra and nagar haveli and daman and diu": "26",
  delhi: "07",
  "jammu and kashmir": "01",
  ladakh: "38",
  lakshadweep: "31",
  puducherry: "34",
};

export function normalizeStateKey(state: string): string {
  return state.trim().toLowerCase();
}

export function getStateCode(state: string | null | undefined): string {
  if (!state) return "";
  return STATE_CODE_MAP[normalizeStateKey(state)] || "";
}

export function getStateOptions(): Array<{ value: string; label: string; code: string }> {
  return Object.keys(STATE_CODE_MAP).map((state) => ({
    value: state,
    code: STATE_CODE_MAP[state],
    label: state
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));
}

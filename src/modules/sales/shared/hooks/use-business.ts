"use client";

import { useMemo } from "react";



export interface BusinessUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
}

export interface BusinessInfo {
  id: string;
  name: string;
  legalName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  stateCode?: string | null;
  pincode?: string | null;
  country: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIFSC?: string | null;
  bankBranch?: string | null;
  upiId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  logo?: string | null;
}

export interface BusinessContext {
  user: BusinessUser | null;
  business: BusinessInfo | null;
}

/** Dummy until real session API is wired */
const DUMMY: BusinessContext = {
  user: {
    id: "user_aas_001",
    name: "Chinmaya Das",
    email: "chinmaya@aas.technology",
    phone: "+91 98765 43210",
    role: "admin",
  },
  business: {
    id: "aas-international",
    name: "AAS International",
    legalName: "AAS International Private Limited",
    gstin: "21AABCA1234A1Z5",
    pan: "AABCA1234A",
    phone: "+91 6742571111",
    email: "marketing@aas.technology",
    addressLine1: "Plot No. 52, 2nd Floor, Bapuji Nagar",
    addressLine2: "Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha",
    stateCode: "21",
    pincode: "751009",
    country: "India",
    bankName: "State Bank of India",
    bankAccountNumber: "123456789012",
    bankIFSC: "SBIN0001234",
    bankBranch: "Bhubaneswar Main Branch",
    upiId: "aasinternational@upi",
    branchId: "AASI-BR-001",
    branchName: "Bhubaneswar Head Office",
    logo: "https://www.aasint.com/assets/aaslogo.png",
  },
};

export function useBusiness(): {
  data: BusinessContext | null;
  isLoading: boolean;
  isError: boolean;
} {
  const data = useMemo(() => DUMMY, []);
  return { data, isLoading: false, isError: false };
}

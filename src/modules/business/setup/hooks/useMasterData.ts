"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMasterData,
  fetchStatesForCountry,
  fetchCitiesForState,
  selectMasterData,
  selectMasterStatus,
  selectStatesForCountry,
  selectCitiesForState,
} from "../store/masterSlice";

/**
 * Loads all the "static" master lists once (business type, category,
 * industry, registration type, currency, timezone, financial year,
 * document type, country) needed across the wizard.
 *
 * Backed by the businessSetupMasters redux slice, so calling this from
 * multiple step components no longer triggers duplicate network requests
 * — the first mount fetches, everyone else just reads the cached store.
 */
export function useMasterData() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectMasterData);
  const status = useAppSelector(selectMasterStatus);

  useEffect(() => {
    void dispatch(fetchMasterData());
  }, [dispatch]);

  return {
    businessTypes: data.businessTypes,
    businessCategories: data.businessCategories,
    businessSubCategories: data.businessSubCategories,
    industries: data.industries,
    registrationTypes: data.registrationTypes,
    licenseTypes: data.licenseTypes,
    currencies: data.currencies,
    timezones: data.timezones,
    financialYears: data.financialYears,
    documentTypes: data.documentTypes,
    countries: data.countries,
    loading: status === "idle" || status === "loading",
  };
}

/**
 * Cascading country -> state -> city selects. Give it the current
 * countryId / stateId (from the form) and it fetches the right
 * child list whenever the parent changes (cached in the slice, so the
 * same country/state pair is never re-fetched by a second component).
 */
export function useLocationOptions(countryId?: string, stateId?: string) {
  const dispatch = useAppDispatch();
  const statesList = useAppSelector(selectStatesForCountry(countryId));
  const citiesList = useAppSelector(selectCitiesForState(stateId));

  useEffect(() => {
    if (countryId) void dispatch(fetchStatesForCountry(countryId));
  }, [dispatch, countryId]);

  useEffect(() => {
    if (stateId) void dispatch(fetchCitiesForState(stateId));
  }, [dispatch, stateId]);

  return {
    states: statesList,
    cities: citiesList,
    loadingStates: Boolean(countryId) && statesList.length === 0,
    loadingCities: Boolean(stateId) && citiesList.length === 0,
  };
}

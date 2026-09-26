import { masterApi } from "../api/master.api";

export const masterService = {
  getBusinessTypes() {
    return masterApi.getBusinessTypes();
  },

  getBusinessCategories() {
    return masterApi.getBusinessCategories();
  },

  getBusinessSubCategories() {
    return masterApi.getBusinessSubCategories();
  },

  getIndustries() {
    return masterApi.getIndustries();
  },

  getRegistrationTypes() {
    return masterApi.getRegistrationTypes();
  },

  getLicenseTypes() {
    return masterApi.getLicenseTypes();
  },

  getCurrencies() {
    return masterApi.getCurrencies();
  },

  getTimezones() {
    return masterApi.getTimezones();
  },

  getFinancialYears() {
    return masterApi.getFinancialYears();
  },

  getDocumentTypes() {
    return masterApi.getDocumentTypes();
  },

  getCountries() {
    return masterApi.getCountries();
  },

  getStates(countryId: string) {
    return masterApi.getStates(countryId);
  },

  getCities(stateId: string) {
    return masterApi.getCities(stateId);
  },
};

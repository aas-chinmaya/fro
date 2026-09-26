import {
  categoryMasterApi,
  currencyMasterApi,
  subCategoryMasterApi,
  registrationTypeMasterApi,
  industryMasterApi,
  licenseTypeMasterApi,
  getErrorMessage,
} from "../api/master.api";

// Thin pass-through service layer for the master admin screens
// (Category / Currency / SubCategory / Registration Type / Industry / License).
// Components should depend on these service objects rather than importing
// the api layer directly, so the api layer stays free to change its
// request/response shape without touching every admin screen.

export const categoryMasterService = {
  list: categoryMasterApi.list,
  create: categoryMasterApi.create,
  update: categoryMasterApi.update,
  remove: categoryMasterApi.remove,
  getErrorMessage,
};

export const currencyMasterService = {
  list: currencyMasterApi.list,
  create: currencyMasterApi.create,
  update: currencyMasterApi.update,
  remove: currencyMasterApi.remove,
  getErrorMessage,
};

export const subCategoryMasterService = {
  list: subCategoryMasterApi.list,
  create: subCategoryMasterApi.create,
  update: subCategoryMasterApi.update,
  remove: subCategoryMasterApi.remove,
  getErrorMessage,
};

export const registrationTypeMasterService = {
  list: registrationTypeMasterApi.list,
  create: registrationTypeMasterApi.create,
  update: registrationTypeMasterApi.update,
  remove: registrationTypeMasterApi.remove,
  getErrorMessage,
};

export const industryMasterService = {
  list: industryMasterApi.list,
  create: industryMasterApi.create,
  update: industryMasterApi.update,
  remove: industryMasterApi.remove,
  getErrorMessage,
};

export const licenseTypeMasterService = {
  list: licenseTypeMasterApi.list,
  create: licenseTypeMasterApi.create,
  update: licenseTypeMasterApi.update,
  remove: licenseTypeMasterApi.remove,
  getErrorMessage,
};

export { getErrorMessage };

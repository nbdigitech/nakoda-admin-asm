import callFunction from "./firebaseFunctions";

// ASM Related Functions
export const getTour = () => callFunction("getTour");
export const getSurvey = (payload) => callFunction("getSurvey", payload);
export const getDistrict = () => callFunction("getDistrict");
export const getCity = () => callFunction("getCity");
export const getState = () => callFunction("getState");

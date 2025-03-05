export const saveToLocalStorage = (data: string | JSON) => {
  window.localStorage.setItem("autoSaved", JSON.stringify(data));
  return true;
};

export const loadFromLocalStorage = () => {
  const dataAsString = window.localStorage.getItem("autoSaved");
  if (dataAsString) {
    return JSON.parse(dataAsString)?.map((item: string) => JSON.parse(item));
  }
};

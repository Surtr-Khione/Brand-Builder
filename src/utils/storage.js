const STORAGE_KEY = "bb-v5";

export async function loadBrand() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load brand from storage:", e);
  }
  return null;
}

export async function saveBrand(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn("Failed to save brand to storage:", e);
    return false;
  }
}

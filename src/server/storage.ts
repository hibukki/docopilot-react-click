export const getPersistentStorage = (key: string): string | null => {
  try {
    return PropertiesService.getUserProperties().getProperty(key);
  } catch (e) {
    throw new Error(`getPersistentStorage("${key}") failed: ${e}`);
  }
};

export const setPersistentStorage = (key: string, value: string): void => {
  try {
    PropertiesService.getUserProperties().setProperty(key, value);
  } catch (e) {
    throw new Error(`setPersistentStorage("${key}") failed: ${e}`);
  }
};

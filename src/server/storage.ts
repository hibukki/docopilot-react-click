export const getPersistentStorage = (key: string): string | null =>
  PropertiesService.getUserProperties().getProperty(key);

export const setPersistentStorage = (key: string, value: string): void => {
  PropertiesService.getUserProperties().setProperty(key, value);
};

export const getPersistentStorage = (key: string): string | null => {
  try {
    return PropertiesService.getUserProperties().getProperty(key);
  } catch (e) {
    throw new Error(`getPersistentStorage("${key}") failed: ${e}`);
  }
};

// Temporary diagnostics — will be removed once PropertiesService works.
export const testEcho = (msg: string): string => `Echo: ${msg}`;

export const debugStorage = (): string => {
  const results: string[] = [];
  try {
    PropertiesService.getUserProperties().setProperty('_test', 'hello');
    const val = PropertiesService.getUserProperties().getProperty('_test');
    results.push(`getUserProperties: OK (got "${val}")`);
  } catch (e) {
    results.push(`getUserProperties: FAILED — ${e}`);
  }
  try {
    PropertiesService.getScriptProperties().setProperty('_test', 'hello');
    const val = PropertiesService.getScriptProperties().getProperty('_test');
    results.push(`getScriptProperties: OK (got "${val}")`);
  } catch (e) {
    results.push(`getScriptProperties: FAILED — ${e}`);
  }
  return results.join('\n');
};

export const setPersistentStorage = (key: string, value: string): void => {
  try {
    PropertiesService.getUserProperties().setProperty(key, value);
  } catch (e) {
    throw new Error(`setPersistentStorage("${key}") failed: ${e}`);
  }
};

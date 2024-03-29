export const useStorage = PREFIX => {
  const PREFIX_KEY = PREFIX || 'anira-kids'; // Your project name.

  const composeKey = key => {
    return `${PREFIX_KEY}:${key}`;
  };

  const set = function (key, value) {
    localStorage.setItem(composeKey(key), JSON.stringify(value));
  };

  const get = key => {
    try {
      return JSON.parse(localStorage.getItem(composeKey(key)));
    } catch (e) {
      return null;
    }
  };

  const remove = key => {
    localStorage.removeItem(composeKey(key));
  };

  const clear = () => {
    localStorage.clear();
  };

  return {
    set,
    get,
    remove,
    clear,
  };
};

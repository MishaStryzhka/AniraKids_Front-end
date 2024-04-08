export const useStorage = (
  PREFIX_KEY = 'anira-kids',
  typeStorage = 'local'
) => {
  const storage = typeStorage === 'session' ? sessionStorage : localStorage;

  const composeKey = key => {
    return `${PREFIX_KEY}:${key}`;
  };

  const set = function (key, value) {
    storage.setItem(composeKey(key), JSON.stringify(value));
  };

  const get = key => {
    try {
      return JSON.parse(storage.getItem(composeKey(key)));
    } catch (e) {
      return null;
    }
  };

  const remove = key => {
    storage.removeItem(composeKey(key));
  };

  const clear = () => {
    storage.clear();
  };

  return {
    set,
    get,
    remove,
    clear,
  };
};

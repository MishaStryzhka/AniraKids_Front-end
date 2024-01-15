export const detectLanguageFromStore = () => {
  return JSON.parse(
    localStorage.getItem('persist:settings')
    // eslint-disable-next-line no-useless-escape
  )?.currentLanguage.replace(/\"/g, '');
};

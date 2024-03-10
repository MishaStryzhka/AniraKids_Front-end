const { useEffect } = require('react');

export const usePageMeta = description => {
  const defaultDesc = 'description';

  useEffect(() => {
    const prevMeta = document
      .querySelector("meta[name='description']")
      .getAttribute('content');
    document
      .querySelector("meta[name='description']")
      .setAttribute('content', description || defaultDesc);

    return () => {
      document
        .querySelector("meta[name='description']")
        .setAttribute('content', prevMeta || defaultDesc);
    };
  }, [defaultDesc, description]);
};

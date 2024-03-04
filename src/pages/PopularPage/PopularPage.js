import { useEffect, useState } from 'react';

const api = require('../../api');

const PopularPage = () => {
  const [productsByCategory, setProductsByCategory] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();

  console.log('productsByCategory', productsByCategory);

  useEffect(() => {
    setIsLoading(true);

    api
      .getPopular()
      .then(data => {
        setProductsByCategory(data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, []);

  return <p>popularPage</p>;
};

export default PopularPage;

import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { id } = useParams();
  console.log('id', id);

  return <p>ProductPage</p>;
};

export default ProductPage;

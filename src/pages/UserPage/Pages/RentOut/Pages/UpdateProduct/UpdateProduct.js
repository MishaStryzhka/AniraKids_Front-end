import FormAddProduct from 'components/Forms/FormAddProduct/FormAddProduct';
import { useParams } from 'react-router-dom';

const UpdateProduct = () => {
  const { id } = useParams();

  return <FormAddProduct id={id} />;
};

export default UpdateProduct;

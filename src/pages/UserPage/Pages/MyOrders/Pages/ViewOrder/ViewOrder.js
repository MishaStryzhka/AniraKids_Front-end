import ViewOrderProduct from 'components/ViewOrderProduct/ViewOrderProduct';
import { useLocation } from 'react-router-dom';

const ViewOrder = () => {
  const location = useLocation();
  console.log(location);
  return <ViewOrderProduct />;
};
export default ViewOrder;

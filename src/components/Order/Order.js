import FormOrder from 'components/Forms/FormOrder/FormOrder';

const Order = ({ order }) => {
  console.log('order', order);

  return (
    <div>
      <h2>Оформлення замовлення {`( ${order.items[0].serviceType} )`}</h2>

      <div>
        {order.items.map(item => {
          console.log('item', item);

          return (
            <div key={item._id}>
              <div>
                <img
                  width="150px"
                  height="150px"
                  src={item.product.photos[0].path}
                  alt="product"
                />
                <div>
                  <p>Продавець: {item.owner.nickname}</p>
                  <p>{item.product.name}</p>
                </div>
              </div>
              <div>
                <p>{item.price}</p>
                <p>{item.quantity}</p>
                <p>{item.price * item.quantity}</p>
              </div>
            </div>
          );
        })}
      </div>
      <FormOrder />
    </div>
  );
};

export default Order;

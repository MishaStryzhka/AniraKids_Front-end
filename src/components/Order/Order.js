import FormOrder from 'components/Forms/FormOrder/FormOrder';
import IconBasket from 'images/icons/IconBasket';
import { useState } from 'react';

const api = require('../../api');

const Order = ({ order, handleRemoveOrder }) => {
  const [items, setItems] = useState(order.items);

  const handleIncrement = ({ _id: productId, quantity }) => {
    api
      .setQuantity({ productId, quantity: quantity + 1 })
      .then(({ updatedItem }) => {
        setItems(prevItems =>
          prevItems.map(item =>
            item._id === updatedItem._id ? updatedItem : item
          )
        );
      });
  };

  const handleDecrement = ({ _id: productId, quantity }) => {
    if (quantity > 1) {
      api
        .setQuantity({ productId, quantity: quantity - 1 })
        .then(({ updatedItem }) => {
          setItems(prevItems =>
            prevItems.map(item =>
              item._id === updatedItem._id ? updatedItem : item
            )
          );
        });
    }
  };

  const handleRemove = productId => {
    if (items.length === 1) {
      handleRemoveOrder();
    } else {
      api
        .removeProductFromOrder(order._id, productId)
        .then(data =>
          setItems(prefItems =>
            prefItems.filter(item => item._id !== productId)
          )
        );
    }
  };

  return (
    <div>
      <h2>Оформлення замовлення {`( ${items[0].serviceType} )`}</h2>

      <div>
        {items.map(item => {
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
                <button onClick={() => handleIncrement(item)}>+</button>
                <p>{item.quantity}</p>
                <button
                  disabled={item.quantity === 1}
                  onClick={() => handleDecrement(item)}
                >
                  -
                </button>
                <p>{item.price * item.quantity}</p>
                <button onClick={() => handleRemove(item._id)}>
                  <IconBasket stroke={'#000'} />
                </button>
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

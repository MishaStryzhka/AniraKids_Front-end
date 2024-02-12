const UsersProductCard = ({ product, handleRemove, handleUpdate }) => {
  return (
    <>
      <p key={product._id}>{product.name}</p>

      <button type="button" onClick={() => handleRemove(product._id)}>
        remove
      </button>
      <button type="button" onClick={() => handleUpdate(product._id)}>
        update
      </button>
    </>
  );
};

export default UsersProductCard;

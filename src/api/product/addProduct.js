import axios from 'axios';

export const addProduct = async credentials => {
  const {
    age,
    brand,
    category,
    childSize,
    color,
    decor,
    name,
    description,
    familyLook,
    photoUrls,
    isAddPhoto,
    isPregnancy,
    keyWord,
    priceRental,
    priceSale,
    rental,
    dailyRentalPrice,
    hourlyRentalPrice,
    sale,
    salePrice,
    size,
    subject,
    outfits,
    toys,
    videoUrl,
    allowPickup,
    pickupAddress,
  } = credentials;

  console.log('pickupAddress', pickupAddress);
  console.log('first', JSON.stringify(pickupAddress));

  const formData = new FormData();

  true &&
    photoUrls.forEach(file => {
      file && formData.append(`photos`, file);
    });

  age && formData.append(`age`, age);
  brand && formData.append(`brand`, brand);
  category && formData.append(`category`, category);
  childSize && formData.append(`childSize`, childSize);
  color && formData.append(`color`, color);
  decor && formData.append(`decor`, decor);
  description && formData.append(`description`, description);
  familyLook && formData.append(`familyLook`, familyLook);
  isAddPhoto && formData.append(`isAddPhoto`, isAddPhoto);
  isPregnancy && formData.append(`isPregnancy`, isPregnancy);
  keyWord && formData.append(`keyWord`, keyWord);
  name && formData.append(`name`, name);
  priceRental && formData.append(`priceRental`, priceRental);
  priceSale && formData.append(`priceSale`, priceSale);
  rental && formData.append(`rental`, rental);
  dailyRentalPrice && formData.append(`dailyRentalPrice`, dailyRentalPrice);
  hourlyRentalPrice && formData.append(`hourlyRentalPrice`, hourlyRentalPrice);
  sale && formData.append(`sale`, sale);
  salePrice && formData.append(`salePrice`, salePrice);
  size && formData.append(`size`, size);
  subject && formData.append(`subject`, subject);
  outfits && formData.append(`outfits`, outfits);
  toys && formData.append(`toys`, toys);
  videoUrl && formData.append(`videoUrl`, videoUrl);
  allowPickup && formData.append(`allowPickup`, allowPickup);
  pickupAddress &&
    formData.append(`pickupAddress`, JSON.stringify(pickupAddress));

  const res = await axios.post(`api/product/addProduct`, formData, {
    headers: { 'content-type': 'multipart/form-data' },
  });

  console.log('res.data', res.data);
  return res.data;
};

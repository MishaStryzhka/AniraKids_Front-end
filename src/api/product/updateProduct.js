import axios from 'axios';

export const updateProduct = async credentials => {
  const {
    id,
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
    deposit,
    sale,
    salePrice,
    size,
    subject,
    outfits,
    toys,
    videoUrl,
    pickupAddress,
  } = credentials;

  const formData = new FormData();
  const metaData = [];
  photoUrls.forEach((photo, index) => {
    if (!photo.path) {
      // new file
      formData.append(`photos`, photo.file);
      metaData.push(photo.file.name);
    } else {
      // old file
      metaData.push(photo._id);
    }
  });
  formData.append(`metaData`, JSON.stringify(metaData));

  age && formData.append(`age`, JSON.stringify(age));
  childSize && formData.append(`childSize`, JSON.stringify(childSize));

  brand && formData.append(`brand`, brand);
  category && formData.append(`category`, category);
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
  deposit && formData.append(`deposit`, deposit);
  sale && formData.append(`sale`, sale);
  salePrice && formData.append(`salePrice`, salePrice);
  size && formData.append(`size`, size);
  subject && formData.append(`subject`, subject);
  outfits && formData.append(`outfits`, outfits);
  toys && formData.append(`toys`, toys);
  videoUrl && formData.append(`videoUrl`, videoUrl);
  pickupAddress &&
    formData.append(`pickupAddress`, JSON.stringify(pickupAddress));

  const res = await axios.patch(`api/product/updateProduct/${id}`, formData, {
    headers: { 'content-type': 'multipart/form-data' },
  });

  return res.data;
};

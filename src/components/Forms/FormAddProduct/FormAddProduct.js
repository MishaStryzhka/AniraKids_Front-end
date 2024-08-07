import IconPhoto from 'images/icons/IconPhoto';
import {
  LabelDescription,
  Field,
  Picture,
  TextInstruction,
  TextPhoto,
  Title,
  WrapPhoto,
  FieldComments,
  GeneralList,
  Button,
  List,
  LabelSize,
  Label,
  WrapCategory,
  Description,
  BoxCategory,
  Wrap,
  BoxColor,
  ItemButton,
  ListColor,
  Input,
  ListHorizont,
  LabelColor,
  WrapChildrenSize,
  WrapCondition,
  GeneralWrap,
  LabelStatus,
  LabelPrice,
  InputPrice,
  Box,
  BoxSize,
  StyledNavLink,
  ButtonSubmit,
  WrapBoxColor,
  WrapChildrenParams,
  LabelChildren,
  WrapperPhotos,
  PhotoImg,
  WrapError,
  FormTablet,
  FormMobile,
  Section,
  ButtonNext,
  WrapInsideSection,
  WrapLabels,
  TitleCategory,
  SectionCondition,
  LabelStatusAgree,
  WrapTextAgree,
  WrapBtnAdd,
  WrapButtons,
  StyledIconCheck,
  ButtonDeletePhoto,
  WrapPhotoLabel,
} from './FormAddProduct.styled';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { validationProductSchema } from 'schemas';
import { ErrorMessage } from '../Form.styled';
import IconCheck from 'images/icons/IconCheck';
import IconPlus from 'images/icons/IconPlus';
import { useTranslation } from 'react-i18next';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import {
  arrayAgeProduct,
  arrayColorsProduct,
  arrayFamilyLookProductMen,
  arrayFamilyLookProductWomen,
  productSubjects,
  arrayOfToysProduct,
  arraySizeAdult,
  arraySizeChildrenProduct,
  arrayofDecorProduct,
  arrayOfOutfits,
} from 'data';
import ModalAttention from 'components/Modals/ModalAttention/ModalAttention';
import CheckBox from 'components/CheckBox/CheckBox';
import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';
import ButtonBack from 'components/Buttons/ButtonBack/ButtonBack';
import IconBasket from 'images/icons/IconBasket';
import { addProduct, getProductById, updateProduct } from 'api';
import PlaceAutocomplete from './PlaceAutocomplete';
import { addPickupAddress, clearDone } from './../../../redux/auth/slice';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';

const FormAddProduct = ({ id }) => {
  // eslint-disable-next-line no-unused-vars
  const [isUpdate, setIsUpdate] = useState(!!id);

  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.formAddProduct',
  });
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();
  const navigate = useNavigate();

  // update product
  const [product, setProduct] = useState();

  const [stepValue, setStepValue] = useState(1);

  const [isOpenModalMaxSize, setIsOpenModalMaxSize] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!product && isUpdate) {
      setIsLoading(true);

      getProductById(id)
        .then(data => {
          setProduct(data.product);
          setIsLoading(false);
        })
        .catch(error => {
          setError(error);
          setIsLoading(false);
        });
    }
  }, [id, isUpdate, product]);

  // ===========

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = ({ event: e, targetPhoto, photoUrls, setPhotoUrls }) => {
    e.preventDefault();
    const draggedPhotoId = e.dataTransfer.getData('text/plain');

    // Отримуємо індекс фотографії, яку перетягували
    const draggedPhotoIndex = photoUrls.findIndex(
      photo => photo._id === draggedPhotoId
    );

    // Отримуємо індекс фотографії, на яку перетягували
    const targetPhotoIndex = photoUrls.findIndex(
      photo => photo._id === targetPhoto._id
    );

    const elem = photoUrls[draggedPhotoIndex];
    const newOrderTest = [...photoUrls];

    // // Міняємо місцями фотографії в масиві
    newOrderTest.splice(draggedPhotoIndex, 1);
    newOrderTest.splice(targetPhotoIndex, 0, elem);

    setPhotoUrls(newOrderTest);
  };

  // ===========
  const wrapPhototsRef = useRef(null);

  useEffect(() => {
    const wrapPhotots = wrapPhototsRef?.current;
    if (wrapPhotots) {
      const handleScroll = event => {
        const wrapPhotots = wrapPhototsRef.current;

        const scrollStep = 25;

        if (event.deltaY > 0) {
          wrapPhotots.scrollLeft += scrollStep;
        } else {
          wrapPhotots.scrollLeft -= scrollStep;
        }

        event.preventDefault();
      };

      wrapPhotots.addEventListener('wheel', handleScroll);

      return () => {
        wrapPhotots.removeEventListener('wheel', handleScroll);
      };
    }
  }, []);

  addPickupAddress();
  clearDone();

  // ===========
  const handleFormSubmit = values => {
    setIsLoading(true);
    if (isUpdate) {
      updateProduct({ id, ...values })
        .then(data => {
          setProduct(data.product);
          dispatch(addPickupAddress(data.product.pickupAddress));
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      addProduct(values)
        .then(data => {
          dispatch(addPickupAddress(data.product.pickupAddress));
          setIsLoading(false);
          navigate('/my-account/rent-out', { replace: true });
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };

  if (isUpdate && !product) return;

  return isLoading ? (
    <p>Loading</p>
  ) : (
    <>
      <Formik
        initialValues={{
          photoUrls: product?.photos || [],
          category: product?.category || '',
          videoUrl: product?.videoUrl || '',
          name: product?.name || '',
          description: product?.description || '',
          brand: product?.brand || '',
          familyLook: product?.familyLook || '',
          size: product?.size || '',
          isPregnancy: product?.isPregnancy || '',
          subject: product?.subject || '',
          outfits: product?.outfits || '',
          age: Array.isArray(product?.age)
            ? [...product?.age]
            : [product?.age] || [],
          childSize: Array.isArray(product?.childSize)
            ? [...product?.childSize]
            : [product?.childSize] || [],
          decor: product?.decor || '',
          color: product?.color || '',
          saleOrRental: product?.saleOrRental || '',
          rental: product?.rental || '',
          dailyRentalPrice: product?.dailyRentalPrice || '',
          hourlyRentalPrice: product?.hourlyRentalPrice || '',
          deposit: product?.deposit || '',

          sale: product?.sale || '',
          salePrice: product?.salePrice || '',

          pickupAddress: product?.pickupAddress,

          isAddPhoto: product?.isAddPhoto || '',
          colorCode: product?.colorCode || '',
          keyWord: product?.keyWord || '',
        }}
        validationSchema={validationProductSchema}
        onSubmit={handleFormSubmit}
      >
        {formikProps => {
          const {
            values,
            errors,
            touched,
            setTouched,
            setErrors,
            setFieldValue,
            handleChange,
            handleSubmit,
            handleBlur,
            validateField,
          } = formikProps;

          const resetInitialValuesForCategories = () => {
            setFieldValue('familyLook', '');
            setFieldValue('isPregnancy', '');
            setFieldValue('size', '');
            setFieldValue('subject', '');
            setFieldValue('age', '');
            setFieldValue('childSize', '');
            setFieldValue('decor', '');
            setFieldValue('toys', '');
          };

          if (Object.keys(errors).length > 0) {
            const errorSection = document.getElementById(
              `section-${Object.keys(errors)[0]}`
            );

            if (
              Object.keys(errors)[0] === 'photoUrls' &&
              Object.keys(touched).includes('photoUrls')
            ) {
              setStepValue(1);
              errorSection &&
                errorSection.scrollIntoView({ behavior: 'smooth' });
            } else if (
              (Object.keys(errors)[0] === 'name' && touched?.name) ||
              (Object.keys(errors)[0] === 'description' &&
                touched?.description) ||
              (Object.keys(errors)[0] === 'brand' && touched?.brand) ||
              (Object.keys(errors)[0] === 'category' && touched?.category)
            ) {
              setStepValue(2);
              errorSection &&
                errorSection.scrollIntoView({ behavior: 'smooth' });
            } else if (
              (Object.keys(errors)[0] === 'familyLook' &&
                touched?.familyLook) ||
              (Object.keys(errors)[0] === 'isPregnancy' &&
                touched?.isPregnancy) ||
              (Object.keys(errors)[0] === 'size' && touched?.size) ||
              (Object.keys(errors)[0] === 'outfits' && touched?.outfits) ||
              (Object.keys(errors)[0] === 'age' && touched?.age) ||
              (Object.keys(errors)[0] === 'childSize' && touched?.childSize) ||
              (Object.keys(errors)[0] === 'subject' && touched?.subject) ||
              (Object.keys(errors)[0] === 'decor' && touched?.decor) ||
              (Object.keys(errors)[0] === 'toys' && touched?.toys)
            ) {
              setStepValue(3);
              errorSection &&
                errorSection.scrollIntoView({ behavior: 'smooth' });
            }
          }

          const handleDeletePhoto = index => {
            setFieldValue('photoUrls', [...values.photoUrls].splice(index, 1));
          };

          return (
            <>
              <FormTablet onSubmit={handleSubmit}>
                <div>
                  <Field
                    style={{ display: 'none' }}
                    type="file"
                    id="photoUrls"
                    value=""
                    name="photoUrls"
                    accept=".jpg, .jpeg, .png"
                    onChange={e => {
                      let selectedFiles = Array.from(e.target.files);

                      if (selectedFiles.length + values.photoUrls.length > 10) {
                        setIsOpenModalMaxSize(true);
                        return;
                      }

                      if (selectedFiles.some(file => file.size > 10485760)) {
                        selectedFiles = selectedFiles.filter(
                          file => file.size < 10485760
                        );
                        setIsOpenModalMaxSize(true);
                      }

                      setTouched({ ...touched, photoUrls: true });

                      selectedFiles = selectedFiles.map(file => ({
                        file,
                        _id: nanoid(),
                      }));

                      setFieldValue('photoUrls', [
                        ...values.photoUrls,
                        ...selectedFiles.filter(
                          ({ file }) =>
                            file.type !== 'video/quicktime' &&
                            file.size < 10485760
                        ),
                      ]);
                    }}
                    onBlur={handleBlur}
                    multiple
                  />
                  <Title>{t('Upload photo')}</Title>
                  <WrapperPhotos ref={wrapPhototsRef}>
                    {values?.photoUrls?.map((photo, index) => {
                      return (
                        <WrapPhoto
                          key={photo._id}
                          draggable
                          onDragStart={e => handleDragStart(e, photo._id)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={event => {
                            handleDrop({
                              event,
                              targetPhoto: photo,
                              photoUrls: values.photoUrls,
                              setPhotoUrls: e => {
                                setFieldValue('photoUrls', e);
                              },
                            });
                          }}
                        >
                          <ButtonDeletePhoto
                            type="button"
                            onClick={() => handleDeletePhoto(index)}
                          >
                            <IconBasket />
                          </ButtonDeletePhoto>
                          <PhotoImg
                            src={
                              photo?.path
                                ? photo.path
                                : URL.createObjectURL(photo.file)
                            }
                            alt={`photo_${index}`}
                          />
                        </WrapPhoto>
                      );
                    })}
                    {values?.photoUrls?.length < 10 && (
                      <WrapPhotoLabel htmlFor="photoUrls">
                        <Picture>
                          <IconPhoto />
                          <TextPhoto>{t('Upload photo')}</TextPhoto>
                        </Picture>
                      </WrapPhotoLabel>
                    )}
                  </WrapperPhotos>
                  <TextInstruction>
                    {t('instruction upload photo')}
                  </TextInstruction>

                  {errors.photoUrls && touched.photoUrls && (
                    <ErrorMessage>{t(errors.photoUrls)}</ErrorMessage>
                  )}
                </div>
                <div>
                  <Title>{t('addVideo')}</Title>
                  <LabelDescription>
                    {t('labelAddVideo')}
                    <Field
                      name="videoUrl"
                      value={values.videoUrl}
                      type="text"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="https://www.youtube.com/watch?..."
                    />
                    {errors.videoUrl && touched.videoUrl && (
                      <ErrorMessage>{t(errors.videoUrl)}</ErrorMessage>
                    )}
                  </LabelDescription>
                </div>
                <div>
                  <Title>{t('describeItem')}</Title>
                  <LabelDescription>
                    {t('nameItem')}*
                    <Field
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('namePlaceholder')}
                      required
                    />
                    <ErrorMessage>
                      {errors.name && touched.name && t(`${errors.name}`)}
                    </ErrorMessage>
                  </LabelDescription>

                  <LabelDescription>
                    {t('descriptionItem')}*
                    <FieldComments
                      type="text"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('descriptionPlaceholder')}
                      required
                    />
                    <ErrorMessage>
                      {errors.description &&
                        touched.description &&
                        t(`${errors.description}`)}
                    </ErrorMessage>
                  </LabelDescription>

                  <LabelDescription>
                    {t('brandItem')}
                    <Field
                      onChange={handleChange}
                      name="brand"
                      value={values.brand}
                      type="text"
                      placeholder={t('brandPlaceholder')}
                    />
                    <ErrorMessage>
                      {errors.brand && touched.brand && t(`${errors.brand}`)}
                    </ErrorMessage>
                  </LabelDescription>
                </div>

                {/* Buttons of category */}

                <div>
                  <Title>{t('Choose a category')}</Title>
                  <GeneralList>
                    <li>
                      <Button
                        $active={values.category === 'forWomen'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setTouched({ ...touched, category: true });
                          setFieldValue('category', 'forWomen');
                        }}
                      >
                        {t("Women's Clothing")}
                      </Button>
                    </li>
                    <li>
                      <Button
                        $active={values.category === 'forMen'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setTouched({ ...touched, category: true });
                          setFieldValue('category', 'forMen');
                        }}
                      >
                        {t("Men's Suits")}
                      </Button>
                    </li>
                    <li>
                      <Button
                        $active={values.category === 'forChildren'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setTouched({ ...touched, category: true });
                          setFieldValue('category', 'forChildren');
                        }}
                      >
                        {t("Children's Clothing")}
                      </Button>
                    </li>
                    <li>
                      <Button
                        $active={values.category === 'decorAndToys'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setTouched({ ...touched, category: true });
                          setFieldValue('category', 'decorAndToys');
                        }}
                      >
                        {t('Decor and Toys')}
                      </Button>
                    </li>
                  </GeneralList>

                  {errors.category && touched.category && (
                    <WrapError>
                      <ErrorMessage>{t(errors.category)} </ErrorMessage>
                    </WrapError>
                  )}

                  {/* forWomen / forMen */}

                  {(values.category === 'forWomen' ||
                    values.category === 'forMen') && (
                    <Wrap>
                      <BoxCategory>
                        <WrapCategory>
                          <Description>Family look</Description>
                          <List>
                            {[
                              ...(values.category === 'forWomen'
                                ? arrayFamilyLookProductWomen
                                : arrayFamilyLookProductMen),
                            ].map((valueVariant, index) => (
                              <Label key={index}>
                                <Box>
                                  {values.familyLook === valueVariant && (
                                    <IconCheck />
                                  )}
                                </Box>
                                {t(valueVariant)}
                                <Input
                                  type="radio"
                                  name="familyLook"
                                  value={valueVariant}
                                  onChange={handleChange}
                                />
                              </Label>
                            ))}

                            {errors.familyLook && touched.familyLook && (
                              <ErrorMessage>
                                {t(errors.familyLook)}
                              </ErrorMessage>
                            )}
                          </List>
                        </WrapCategory>
                        {values.category === 'forWomen' && (
                          <WrapCategory>
                            <Description>{t('For pregnant women')}</Description>
                            <Label>
                              <Box>{values.isPregnancy && <IconCheck />}</Box>
                              {t(true)}
                              <Input
                                type="checkbox"
                                name="isPregnancy"
                                value={values.isPregnancy}
                                onChange={handleChange}
                              />
                            </Label>

                            {errors.isPregnancy && touched.isPregnancy && (
                              <ErrorMessage>
                                {t(errors.isPregnancy)}
                              </ErrorMessage>
                            )}
                          </WrapCategory>
                        )}
                      </BoxCategory>
                      <div>
                        <Title>{t('Specify the size')}</Title>
                        <ListHorizont>
                          {arraySizeAdult.map(({ descriptionSize }, index) => (
                            <li key={index}>
                              <LabelSize>
                                <BoxSize
                                  $check={values?.size === descriptionSize}
                                >
                                  {descriptionSize}
                                </BoxSize>
                                <Input
                                  type="radio"
                                  name="size"
                                  value={descriptionSize}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </LabelSize>
                            </li>
                          ))}
                        </ListHorizont>
                        {errors.size && touched.size && (
                          <WrapError>
                            <ErrorMessage>{t(errors.size)}</ErrorMessage>
                          </WrapError>
                        )}
                      </div>
                    </Wrap>
                  )}

                  {/* forChildren */}

                  {values.category === 'forChildren' && (
                    <Wrap>
                      <BoxCategory>
                        <WrapCategory>
                          <Description>{t('Outfits')}</Description>
                          <List>
                            {arrayOfOutfits.map((valueOutfits, index) => (
                              <Label key={index}>
                                <Box>
                                  {values.outfits === valueOutfits && (
                                    <IconCheck />
                                  )}
                                </Box>
                                {t(valueOutfits)}
                                <Input
                                  type="radio"
                                  name="outfits"
                                  value={valueOutfits}
                                  onChange={handleChange}
                                />
                              </Label>
                            ))}
                          </List>
                          <ErrorMessage>
                            {errors.outfits &&
                              touched.outfits &&
                              t(errors.outfits)}
                          </ErrorMessage>
                        </WrapCategory>
                      </BoxCategory>
                      <div>
                        <Title>{t('Age')}</Title>
                        <WrapChildrenParams>
                          {arrayAgeProduct.map((productAge, index) => (
                            <li key={index}>
                              <LabelChildren>
                                <BoxSize $check={values.age === productAge.age}>
                                  <CheckBox
                                    value={values.age.includes(productAge.age)}
                                  />
                                  {productAge[i18n.language]}
                                </BoxSize>
                                <Field
                                  style={{ display: 'none' }}
                                  type="checkbox"
                                  name="age"
                                  value={productAge.age}
                                  id={productAge.age}
                                  onChange={handleChange}
                                />
                              </LabelChildren>
                            </li>
                          ))}
                        </WrapChildrenParams>

                        {errors.age && touched.age && (
                          <WrapError>
                            <ErrorMessage>{t(errors.age)}</ErrorMessage>
                          </WrapError>
                        )}
                      </div>
                      <div>
                        <Title>{t('Size')}</Title>
                        <WrapChildrenSize>
                          {arraySizeChildrenProduct.map((childSize, index) => (
                            <li key={index}>
                              <LabelChildren>
                                <BoxSize
                                  $check={values.childSize === childSize}
                                >
                                  <CheckBox
                                    value={values.childSize.includes(childSize)}
                                  />
                                  {`${childSize} ${t('sizecm')}`}
                                </BoxSize>
                                <Field
                                  style={{ display: 'none' }}
                                  type="checkbox"
                                  name="childSize"
                                  value={childSize}
                                  id={childSize}
                                  onChange={handleChange}
                                />
                              </LabelChildren>
                            </li>
                          ))}
                        </WrapChildrenSize>

                        {errors.childSize && touched.childSize && (
                          <WrapError>
                            <ErrorMessage>{t(errors.childSize)}</ErrorMessage>
                          </WrapError>
                        )}
                      </div>
                    </Wrap>
                  )}

                  {/* decorAndToys */}

                  {values.category === 'decorAndToys' && (
                    <Wrap>
                      <BoxCategory>
                        <WrapCategory>
                          <Description>{t('Subject')}</Description>
                          <List>
                            {productSubjects.map((valueSubject, index) => (
                              <Label key={index}>
                                <Box>
                                  {values.subject === valueSubject && (
                                    <IconCheck />
                                  )}
                                </Box>
                                {t(valueSubject)}
                                <Input
                                  type="radio"
                                  name="subject"
                                  value={valueSubject}
                                  onChange={handleChange}
                                />
                              </Label>
                            ))}
                          </List>
                          <ErrorMessage>
                            {errors.subject &&
                              touched.subject &&
                              t(errors.subject)}
                          </ErrorMessage>
                        </WrapCategory>
                        <WrapCategory>
                          <Description>{t('Decor')}</Description>
                          <List>
                            {arrayofDecorProduct.map(
                              ({ searchDecor }, index) => (
                                <Label key={index}>
                                  <Box>
                                    {values.decor === searchDecor && (
                                      <IconCheck />
                                    )}
                                  </Box>
                                  {t(searchDecor)}
                                  <Input
                                    type="radio"
                                    name="decor"
                                    value={searchDecor}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                </Label>
                              )
                            )}
                          </List>

                          {errors.decor && touched.decor && (
                            <WrapError>
                              <ErrorMessage>{t(errors.decor)}</ErrorMessage>
                            </WrapError>
                          )}
                        </WrapCategory>
                        <WrapCategory>
                          <Description>{t('Toys')}</Description>
                          <List>
                            {arrayOfToysProduct.map(({ typeOfToys }, index) => (
                              <Label key={index}>
                                <Box>
                                  {values.toys === typeOfToys && <IconCheck />}
                                </Box>
                                {t(typeOfToys)}
                                <Input
                                  type="radio"
                                  name="toys"
                                  value={typeOfToys}
                                  onChange={handleChange}
                                />
                              </Label>
                            ))}
                            {errors.toys && touched.toys && (
                              <ErrorMessage>{t(errors.toys)}</ErrorMessage>
                            )}
                          </List>
                        </WrapCategory>
                      </BoxCategory>
                    </Wrap>
                  )}
                </div>

                {/* Сolor of product */}

                <div>
                  <Title>{t('Color')}</Title>
                  <ListColor>
                    {arrayColorsProduct.map(({ colorCode, color }, index) => {
                      return (
                        <ItemButton key={index}>
                          <LabelColor>
                            <Input
                              type="radio"
                              name="color"
                              value={color}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <WrapBoxColor $check={values.color === color}>
                              <BoxColor color={colorCode} />
                              {t(color)}
                            </WrapBoxColor>
                          </LabelColor>
                        </ItemButton>
                      );
                    })}
                  </ListColor>
                  {/* <TextInstruction>{t('descriptionColor')}</TextInstruction> */}

                  {errors.color && touched.color && (
                    <WrapError>
                      <ErrorMessage>{t(errors.color)}</ErrorMessage>
                    </WrapError>
                  )}
                </div>

                {/* Rental or Sale of Product */}
                <div>
                  <Title>{t('title rent-sale')}</Title>
                  <GeneralWrap>
                    <WrapCondition>
                      <LabelStatus>
                        <Box>{values.rental && <IconCheck />}</Box>
                        {t('Rental')}
                        <Input
                          type="checkbox"
                          name="rental"
                          value={values.rental}
                          onChange={e => {
                            e.currentTarget.value === 'true' &&
                              setFieldValue('rentalPrice', '');
                            handleChange(e);
                          }}
                          onBlur={handleBlur}
                        />
                      </LabelStatus>
                      <LabelPrice>
                        {t('Price')} (Kč/den)
                        <InputPrice
                          placeholder={t('pricePlaceholder')}
                          type="number"
                          name="dailyRentalPrice"
                          value={values.dailyRentalPrice}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!values.rental}
                        />
                      </LabelPrice>
                      {errors.dailyRentalPrice && touched.dailyRentalPrice && (
                        <WrapError>
                          <ErrorMessage>
                            {t(errors.dailyRentalPrice)}
                          </ErrorMessage>
                        </WrapError>
                      )}
                      <LabelPrice>
                        {t('Price')} (Kč/hod)
                        <InputPrice
                          placeholder={t('pricePlaceholder')}
                          type="number"
                          name="hourlyRentalPrice"
                          value={values.hourlyRentalPrice}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!values.rental}
                        />
                      </LabelPrice>
                      {errors.hourlyRentalPrice &&
                        touched.hourlyRentalPrice && (
                          <WrapError>
                            <ErrorMessage>
                              {t(errors.hourlyRentalPrice)}
                            </ErrorMessage>
                          </WrapError>
                        )}
                      <LabelPrice>
                        {t('deposit')}
                        <InputPrice
                          placeholder={2000}
                          type="number"
                          name="deposit"
                          value={values.deposit}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!values.rental}
                        />
                      </LabelPrice>
                      {errors.deposit && touched.deposit && (
                        <WrapError>
                          <ErrorMessage>{t(errors.deposit)}</ErrorMessage>
                        </WrapError>
                      )}
                    </WrapCondition>
                    <WrapCondition>
                      <LabelStatus>
                        <Box>{values.sale && <IconCheck />}</Box>
                        {t('Sale')}
                        <Input
                          type="checkbox"
                          name="sale"
                          value={values.sale}
                          onChange={e => {
                            e.currentTarget.value === 'true' &&
                              setFieldValue('salePrice', '');
                            handleChange(e);
                          }}
                          onBlur={handleBlur}
                        />
                      </LabelStatus>
                      <LabelPrice>
                        {t('Price')} (Kč)
                        <InputPrice
                          placeholder={t('pricePlaceholder')}
                          type="number"
                          name="salePrice"
                          value={values.salePrice}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!values.sale}
                        />
                      </LabelPrice>
                    </WrapCondition>
                  </GeneralWrap>

                  {errors.rental && touched.rental && (
                    <WrapError>
                      <ErrorMessage>{t(errors.rental)}</ErrorMessage>
                    </WrapError>
                  )}
                </div>

                {/* самовивіз */}

                <div>
                  <Title>{t('pickup')}</Title>
                  {/* <GeneralWrap> */}
                  <WrapCondition>
                    <PlaceAutocomplete
                      value={values.pickupAddress}
                      name="pickupAddress"
                      placeholder={t('address')}
                      onPlaceSelect={pickupAddress => {
                        return setFieldValue('pickupAddress', pickupAddress);
                      }}
                    />
                    {errors.pickupAddress && touched.pickupAddress && (
                      <WrapError>
                        <ErrorMessage>{t(errors.pickupAddress)}</ErrorMessage>
                      </WrapError>
                    )}
                  </WrapCondition>
                  {/* </GeneralWrap> */}
                </div>

                {/* KEYWORDS of Product */}

                <div>
                  <Title>{t('keywords')}</Title>
                  <Description>{t('labelKeywords')}</Description>

                  <Field
                    type="text"
                    name="keyWord"
                    value={values.keyWord}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t('keywordsPlaceholder')}
                  />
                  <TextInstruction>{t('addsKeywords')}</TextInstruction>
                </div>

                {/*  AGREE ADD PHOTO of Product */}

                <LabelStatusAgree>
                  <Box>{values.isAddPhoto && <IconCheck />}</Box>
                  <WrapTextAgree>
                    {t('yourAgree')}
                    <StyledNavLink>{t('linkAgree')}</StyledNavLink>
                  </WrapTextAgree>
                  <Input
                    type="checkbox"
                    name="isAddPhoto"
                    value={values.isAddPhoto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </LabelStatusAgree>

                <ButtonSubmit type="submit" disabled={isLoading}>
                  {!isLoading ? (
                    <>
                      {isUpdate ? t('save') : t('addProduct')}
                      {!isUpdate && <IconPlus />}
                    </>
                  ) : (
                    <BeatLoader color="#EBDAD1" />
                  )}
                </ButtonSubmit>
              </FormTablet>

              {/*  */}
              {/* MOBILE ADAPTIVE */}
              {/*  */}

              <FormMobile onSubmit={handleSubmit}>
                {stepValue === 1 && (
                  <Section>
                    <WrapInsideSection>
                      <div id="section-photoUrls">
                        <Field
                          style={{ display: 'none' }}
                          type="file"
                          id="photoUrls"
                          value=""
                          name="photoUrls"
                          accept=".jpg, .jpeg, .png"
                          onChange={e => {
                            let selectedFiles = Array.from(e.target.files);

                            if (
                              selectedFiles.length + values.photoUrls.length >
                              10
                            ) {
                              setIsOpenModalMaxSize(true);
                              return;
                            }

                            if (
                              selectedFiles.some(file => file.size > 10485760)
                            ) {
                              selectedFiles = selectedFiles.filter(
                                file => file.size < 10485760
                              );
                              setIsOpenModalMaxSize(true);
                            }

                            setTouched({ ...touched, photoUrls: true });

                            selectedFiles = selectedFiles.map(file => ({
                              file,
                              _id: nanoid(),
                            }));

                            setFieldValue('photoUrls', [
                              ...values.photoUrls,
                              ...selectedFiles.filter(
                                ({ file }) =>
                                  file.type !== 'video/quicktime' &&
                                  file.size < 10485760
                              ),
                            ]);
                          }}
                          onBlur={handleBlur}
                          multiple
                        />
                        <Title>{t('Upload photo')}</Title>
                        <WrapperPhotos ref={wrapPhototsRef}>
                          {values?.photoUrls?.map((photo, index) => {
                            return (
                              <WrapPhoto
                                key={photo._id}
                                draggable
                                onDragStart={e => handleDragStart(e, photo._id)}
                                onDragOver={e => e.preventDefault()}
                                onDrop={event => {
                                  handleDrop({
                                    event,
                                    targetPhoto: photo,
                                    photoUrls: values.photoUrls,
                                    setPhotoUrls: e => {
                                      setFieldValue('photoUrls', e);
                                    },
                                  });
                                }}
                              >
                                <ButtonDeletePhoto
                                  type="button"
                                  onClick={() => handleDeletePhoto(index)}
                                >
                                  <IconBasket />
                                </ButtonDeletePhoto>
                                <PhotoImg
                                  src={
                                    photo?.path
                                      ? photo.path
                                      : URL.createObjectURL(photo.file)
                                  }
                                  alt={`photo_${index}`}
                                />
                              </WrapPhoto>
                            );
                          })}
                          {values?.photoUrls?.length < 10 && (
                            <WrapPhotoLabel htmlFor="photoUrls">
                              <Picture>
                                <IconPhoto />
                                <TextPhoto>{t('Upload photo')}</TextPhoto>
                              </Picture>
                            </WrapPhotoLabel>
                          )}
                        </WrapperPhotos>
                        <TextInstruction>
                          {t('instruction upload photo')}
                        </TextInstruction>

                        {errors.photoUrls && touched.photoUrls && (
                          <ErrorMessage>{t(errors.photoUrls)}</ErrorMessage>
                        )}
                      </div>
                      <div id="section-videoUrl">
                        <Title>{t('addVideo')}</Title>
                        <LabelDescription>
                          {t('labelAddVideo')}
                          <Field
                            name="videoUrl"
                            value={values.videoUrl}
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="https://www.youtube.com/watch?..."
                          />

                          {errors.videoUrl && touched.videoUrl && (
                            <ErrorMessage>{t(errors.videoUrl)}</ErrorMessage>
                          )}
                        </LabelDescription>
                      </div>
                    </WrapInsideSection>
                    <WrapButtons>
                      <ButtonAdd
                        onClick={() => {
                          validateField('photoUrls');
                          validateField('videoUrl');
                          setTouched({
                            ...touched,
                            photoUrls: true,
                            videoUrl: true,
                          });
                          const newErrors = {};
                          if (errors?.photoUrls)
                            newErrors.photoUrls = errors.photoUrls;
                          if (errors?.videoUrl)
                            newErrors.videoUrl = errors.videoUrl;
                          setErrors({
                            ...newErrors,
                          });
                          setStepValue(2);
                        }}
                      >
                        {t('btnNext')} 1/4
                      </ButtonAdd>
                    </WrapButtons>
                  </Section>
                )}
                {stepValue === 2 && (
                  <Section>
                    <Title>{t('describeItem')}</Title>
                    <WrapLabels>
                      <LabelDescription id="section-name">
                        {t('nameItem')}*
                        <Field
                          type="text"
                          name="name"
                          value={values.name}
                          onChange={e => {
                            setTouched({
                              ...touched,
                              name: null,
                              description: null,
                              brand: null,
                              category: null,
                            });
                            handleChange(e);
                          }}
                          onBlur={handleBlur}
                          placeholder={t('namePlaceholder')}
                          required
                        />
                        {errors.name && touched.name && (
                          <ErrorMessage>{t(errors.name)}</ErrorMessage>
                        )}
                      </LabelDescription>

                      <LabelDescription id="section-description">
                        {t('descriptionItem')}*
                        <FieldComments
                          type="text"
                          name="description"
                          value={values.description}
                          onChange={e => {
                            setTouched({
                              ...touched,
                              name: null,
                              description: null,
                              brand: null,
                              category: null,
                            });
                            handleChange(e);
                          }}
                          onBlur={handleBlur}
                          placeholder={t('descriptionPlaceholder')}
                          required
                        />
                        {errors.description && touched.description && (
                          <ErrorMessage>{t(errors.description)} </ErrorMessage>
                        )}
                      </LabelDescription>

                      <LabelDescription id="section-brand">
                        {t('brandItem')}
                        <Field
                          onChange={e => {
                            setTouched({
                              ...touched,
                              name: null,
                              description: null,
                              brand: null,
                              category: null,
                            });
                            handleChange(e);
                          }}
                          name="brand"
                          value={values.brand}
                          type="text"
                          placeholder={t('brandPlaceholder')}
                        />

                        {errors.brand && touched.brand && (
                          <ErrorMessage>{t(errors.brand)}</ErrorMessage>
                        )}
                      </LabelDescription>
                    </WrapLabels>
                    <div id="section-category">
                      <Title>{t('Choose a category')}</Title>
                      <GeneralList>
                        <li>
                          <Button
                            $active={values.category === 'forWomen'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setTouched({ ...touched, category: true });
                              setFieldValue('category', 'forWomen');
                            }}
                          >
                            {t("Women's Clothing")}
                          </Button>
                        </li>
                        <li>
                          <Button
                            $active={values.category === 'forMen'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setTouched({ ...touched, category: true });
                              setFieldValue('category', 'forMen');
                            }}
                          >
                            {t("Men's Suits")}
                          </Button>
                        </li>
                        <li>
                          <Button
                            $active={values.category === 'forChildren'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setTouched({ ...touched, category: true });
                              setFieldValue('category', 'forChildren');
                            }}
                          >
                            {t("Children's Clothing")}
                          </Button>
                        </li>
                        <li>
                          <Button
                            $active={values.category === 'decorAndToys'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setTouched({ ...touched, category: true });
                              setFieldValue('category', 'decorAndToys');
                            }}
                          >
                            {t('Decor and Toys')}
                          </Button>
                        </li>
                        {errors.category && touched.category && (
                          <ErrorMessage>{t(errors.category)}</ErrorMessage>
                        )}
                      </GeneralList>
                    </div>
                    <WrapButtons>
                      <ButtonAdd
                        onClick={() => {
                          validateField('name');
                          validateField('description');
                          validateField('brand');
                          validateField('category');
                          setTouched({
                            ...touched,
                            name: true,
                            description: true,
                            brand: true,
                            category: true,
                          });
                          const newErrors = {};
                          if (errors?.photoUrls)
                            newErrors.photoUrls = errors.photoUrls;
                          if (errors?.videoUrl)
                            newErrors.videoUrl = errors.videoUrl;
                          if (errors?.name) newErrors.name = errors.name;
                          if (errors?.description)
                            newErrors.description = errors.description;
                          if (errors?.brand) newErrors.brand = errors.brand;
                          if (errors?.category)
                            newErrors.category = errors.category;
                          setErrors({
                            ...newErrors,
                          });
                          setStepValue(3);
                        }}
                        disabled={!values.category}
                      >
                        {t('btnNext')} 2/4
                      </ButtonAdd>
                      <ButtonBack
                        onClick={() => {
                          setStepValue(1);
                        }}
                      >
                        Назад
                      </ButtonBack>
                    </WrapButtons>
                  </Section>
                )}

                {stepValue === 3 && (
                  <Section>
                    {/* forWomen / forMen */}

                    {(values.category === 'forWomen' ||
                      values.category === 'forMen') && (
                      <Wrap>
                        {values.category === 'forWomen' && (
                          <TitleCategory>{t("Women's Clothing")}</TitleCategory>
                        )}
                        {values.category === 'forMen' && (
                          <TitleCategory> {t("Men's Suits")}</TitleCategory>
                        )}
                        <BoxCategory>
                          <WrapCategory id="section-familyLook">
                            <Description>Family look</Description>
                            <List>
                              {[
                                ...(values.category === 'forWomen'
                                  ? arrayFamilyLookProductWomen
                                  : arrayFamilyLookProductMen),
                              ].map((valueVariant, index) => (
                                <Label key={index}>
                                  <Box>
                                    {values.familyLook === valueVariant && (
                                      <StyledIconCheck />
                                    )}
                                  </Box>
                                  {t(valueVariant)}
                                  <Input
                                    type="radio"
                                    name="familyLook"
                                    value={valueVariant}
                                    onChange={e => {
                                      setTouched({
                                        ...touched,
                                        name: null,
                                        description: null,
                                        brand: null,
                                        category: null,
                                      });
                                      handleChange(e);
                                    }}
                                  />
                                </Label>
                              ))}

                              {errors.familyLook && touched.familyLook && (
                                <ErrorMessage>
                                  {t(errors.familyLook)}
                                </ErrorMessage>
                              )}
                            </List>
                          </WrapCategory>
                          {values.category === 'forWomen' && (
                            <WrapCategory id="section-isPregnancy">
                              <Description>
                                {t('For pregnant women')}
                              </Description>

                              <Label>
                                <Box>
                                  {values.isPregnancy && <StyledIconCheck />}
                                </Box>
                                {t(true)}
                                <Input
                                  type="checkbox"
                                  name="isPregnancy"
                                  value={values.isPregnancy}
                                  onChange={handleChange}
                                />
                              </Label>

                              {errors.isPregnancy && touched.isPregnancy && (
                                <ErrorMessage>
                                  {t(errors.isPregnancy)}
                                </ErrorMessage>
                              )}
                            </WrapCategory>
                          )}
                        </BoxCategory>
                        <div id="section-size">
                          <Title>{t('Specify the size')}</Title>
                          <ListHorizont>
                            {arraySizeAdult.map(
                              ({ descriptionSize }, index) => (
                                <li key={index}>
                                  <LabelSize>
                                    <BoxSize
                                      $check={values?.size === descriptionSize}
                                    >
                                      {descriptionSize}
                                    </BoxSize>
                                    <Input
                                      type="radio"
                                      name="size"
                                      value={descriptionSize}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                  </LabelSize>
                                </li>
                              )
                            )}
                          </ListHorizont>
                          <WrapError>
                            {errors.size && touched.size && (
                              <ErrorMessage>{t(errors.size)}</ErrorMessage>
                            )}
                          </WrapError>
                        </div>
                      </Wrap>
                    )}

                    {/* forChildren */}

                    {values.category === 'forChildren' && (
                      <Wrap>
                        {values.category === 'forChildren' && (
                          <TitleCategory>
                            {t("Children's Clothing")}
                          </TitleCategory>
                        )}
                        <BoxCategory>
                          <WrapCategory id="section-outfits">
                            <Description>{t('Outfits')}</Description>
                            <List>
                              {arrayOfOutfits.map((valueOutfits, index) => (
                                <LabelChildren key={index}>
                                  <BoxSize
                                    $check={values.outfits.includes(
                                      valueOutfits
                                    )}
                                  >
                                    <CheckBox
                                      value={values.outfits.includes(
                                        valueOutfits
                                      )}
                                    />
                                    {/* {productAge[i18n.language]} */}
                                    {t(valueOutfits)}
                                  </BoxSize>
                                  <Input
                                    type="radio"
                                    name="outfits"
                                    value={valueOutfits}
                                    onChange={handleChange}
                                  />
                                </LabelChildren>
                              ))}
                            </List>
                            {errors.outfits && touched.outfits && (
                              <ErrorMessage>{t(errors.outfits)}</ErrorMessage>
                            )}
                          </WrapCategory>
                        </BoxCategory>
                        <div id="section-age">
                          <Title>{t('Age')}</Title>
                          <WrapChildrenParams>
                            {arrayAgeProduct.map((productAge, index) => (
                              <li key={index}>
                                <LabelChildren>
                                  <BoxSize
                                    $check={values.age.includes(productAge.age)}
                                  >
                                    <CheckBox
                                      value={values.age.includes(
                                        productAge.age
                                      )}
                                    />
                                    {productAge[i18n.language]}
                                  </BoxSize>
                                  <Field
                                    style={{ display: 'none' }}
                                    type="checkbox"
                                    name="age"
                                    value={productAge.age}
                                    id={productAge.age}
                                    onChange={handleChange}
                                  />
                                </LabelChildren>
                              </li>
                            ))}
                          </WrapChildrenParams>

                          {errors.age && touched.age && (
                            <WrapError>
                              <ErrorMessage>{t(errors.age)} </ErrorMessage>
                            </WrapError>
                          )}
                        </div>
                        <div id="section-childSize">
                          <Title>{t('Size')}</Title>
                          <WrapChildrenSize>
                            {arraySizeChildrenProduct.map(
                              (childSize, index) => (
                                <li key={index}>
                                  <LabelChildren>
                                    <BoxSize
                                      $check={values.childSize.includes(
                                        childSize
                                      )}
                                    >
                                      <CheckBox
                                        value={values.childSize.includes(
                                          childSize
                                        )}
                                      />
                                      {`${childSize} ${t('sizecm')}`}
                                    </BoxSize>
                                    <Field
                                      style={{ display: 'none' }}
                                      type="checkbox"
                                      name="childSize"
                                      value={childSize}
                                      id={childSize}
                                      onChange={handleChange}
                                    />
                                  </LabelChildren>
                                </li>
                              )
                            )}
                          </WrapChildrenSize>

                          {errors.childSize && touched.childSize && (
                            <WrapError>
                              <ErrorMessage>{t(errors.childSize)}</ErrorMessage>
                            </WrapError>
                          )}
                        </div>
                      </Wrap>
                    )}

                    {/* decorAndToys */}

                    {values.category === 'decorAndToys' && (
                      <Wrap>
                        {values.category === 'decorAndToys' && (
                          <TitleCategory>{t('Decor and Toys')}</TitleCategory>
                        )}
                        <BoxCategory>
                          <WrapCategory id="section-subject">
                            <Description>{t('Subject')}</Description>
                            <List>
                              {productSubjects.map((valueSubject, index) => (
                                <Label key={index}>
                                  <Box>
                                    {values.subject === valueSubject && (
                                      <StyledIconCheck />
                                    )}
                                  </Box>
                                  {t(valueSubject)}
                                  <Input
                                    type="radio"
                                    name="subject"
                                    value={valueSubject}
                                    onChange={handleChange}
                                  />
                                </Label>
                              ))}
                            </List>
                            <ErrorMessage>
                              {errors.subject &&
                                touched.subject &&
                                t(errors.subject)}
                            </ErrorMessage>
                          </WrapCategory>
                          <WrapCategory id="section-decor">
                            <Description>{t('Decor')}</Description>
                            <List>
                              {arrayofDecorProduct.map(
                                ({ searchDecor }, index) => (
                                  <Label key={index}>
                                    <Box>
                                      {values.decor === searchDecor && (
                                        <StyledIconCheck />
                                      )}
                                    </Box>
                                    {t(searchDecor)}
                                    <Input
                                      type="radio"
                                      name="decor"
                                      value={searchDecor}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                  </Label>
                                )
                              )}
                            </List>

                            {errors.decor && touched.decor && (
                              <WrapError>
                                <ErrorMessage>{t(errors.decor)}</ErrorMessage>
                              </WrapError>
                            )}
                          </WrapCategory>
                          <WrapCategory id="section-toys">
                            <Description>{t('Toys')}</Description>

                            <List>
                              {arrayOfToysProduct.map(
                                ({ typeOfToys }, index) => (
                                  <Label key={index}>
                                    <Box>
                                      {values.toys === typeOfToys && (
                                        <StyledIconCheck />
                                      )}
                                    </Box>
                                    {t(typeOfToys)}
                                    <Input
                                      type="radio"
                                      name="toys"
                                      value={typeOfToys}
                                      onChange={handleChange}
                                    />
                                  </Label>
                                )
                              )}
                            </List>

                            {errors.toys && touched.toys && (
                              <WrapError>
                                <ErrorMessage>{t(errors.toys)}</ErrorMessage>
                              </WrapError>
                            )}
                          </WrapCategory>
                        </BoxCategory>
                      </Wrap>
                    )}
                    <WrapButtons>
                      <ButtonNext
                        onClick={() => {
                          const newErrors = {};
                          if (errors?.photoUrls)
                            newErrors.photoUrls = errors.photoUrls;
                          if (errors?.videoUrl)
                            newErrors.videoUrl = errors.videoUrl;
                          if (errors?.name) newErrors.name = errors.name;
                          if (errors?.description)
                            newErrors.description = errors.description;
                          if (errors?.brand) newErrors.brand = errors.brand;
                          if (errors?.category)
                            newErrors.category = errors.category;

                          if (values.category === 'forWomen') {
                            validateField('familyLook');
                            validateField('size');
                            if (errors?.familyLook)
                              newErrors.familyLook = errors.familyLook;
                            if (errors?.isPregnancy)
                              newErrors.isPregnancy = errors.isPregnancy;
                            if (errors?.size) newErrors.size = errors.size;
                          }

                          if (values.category === 'forMen') {
                            validateField('familyLook');
                            validateField('size');
                            if (errors?.familyLook)
                              newErrors.familyLook = errors.familyLook;
                            if (errors?.size) newErrors.size = errors.size;
                          }

                          if (values.category === 'forChildren') {
                            validateField('outfits');
                            validateField('age');
                            validateField('childSize');
                            if (errors?.outfits)
                              newErrors.outfits = errors.outfits;
                            if (errors?.age) newErrors.age = errors.age;
                            if (errors?.childSize)
                              newErrors.childSize = errors.childSize;
                          }

                          if (values.category === 'decorAndToys') {
                            validateField('subject');
                            validateField('decor');
                            validateField('toys');
                            if (errors?.subject)
                              newErrors.subject = errors.subject;
                            if (errors?.decor) newErrors.decor = errors.decor;
                            if (errors?.toys) newErrors.toys = errors.toys;
                          }

                          setTouched({
                            ...touched,
                            familyLook: true,
                            isPregnancy: true,
                            size: true,
                            outfits: true,
                            age: true,
                            childSize: true,
                            subject: true,
                            decor: true,
                            toys: true,
                          });
                          setErrors({
                            ...newErrors,
                          });
                          setStepValue(4);
                        }}
                      >
                        {t('btnNext')} 3/4
                      </ButtonNext>
                      <ButtonBack
                        onClick={() => {
                          setStepValue(2);
                        }}
                      >
                        Назад
                      </ButtonBack>
                    </WrapButtons>
                  </Section>
                )}
                {stepValue === 4 && (
                  <Section>
                    <div>
                      <Title>{t('Color')}</Title>
                      <ListColor>
                        {arrayColorsProduct.map(
                          ({ colorCode, color }, index) => (
                            <ItemButton key={index}>
                              <LabelColor>
                                <Input
                                  type="radio"
                                  id={color}
                                  name="color"
                                  value={color}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <WrapBoxColor $check={values.color === color}>
                                  <BoxColor color={colorCode} />
                                  {t(color)}
                                </WrapBoxColor>
                              </LabelColor>
                            </ItemButton>
                          )
                        )}
                      </ListColor>
                      {/* <TextInstruction>{t('descriptionColor')}</TextInstruction> */}
                      <WrapError>
                        <ErrorMessage>
                          {errors.color && touched.color && t(errors.color)}
                        </ErrorMessage>
                      </WrapError>
                    </div>
                    <WrapButtons>
                      <ButtonNext
                        onClick={() => {
                          const newErrors = {};
                          if (errors?.color) newErrors.color = errors.color;

                          setTouched({
                            ...touched,
                            color: true,
                          });
                          setErrors({
                            ...newErrors,
                          });
                          setStepValue(5);
                        }}
                      >
                        {t('btnNext')} 4/4
                      </ButtonNext>
                      <ButtonBack
                        onClick={() => {
                          setStepValue(3);
                        }}
                      >
                        Назад
                      </ButtonBack>
                    </WrapButtons>
                  </Section>
                )}
                {stepValue === 5 && (
                  <>
                    <SectionCondition>
                      {/* Rental or Sale of Product */}
                      <div>
                        <Title>{t('title rent-sale')}</Title>
                        <GeneralWrap>
                          <WrapCondition>
                            <LabelStatus>
                              <Box>{values.rental && <StyledIconCheck />}</Box>
                              {t('Rental')}
                              <Input
                                type="checkbox"
                                name="rental"
                                value={values.rental}
                                onChange={e => {
                                  e.currentTarget.value === 'true' &&
                                    setFieldValue('rentalPrice', '');
                                  handleChange(e);
                                }}
                                onBlur={handleBlur}
                              />
                            </LabelStatus>
                            <LabelPrice>
                              {t('Price')} (Kč/den)
                              <InputPrice
                                placeholder={t('pricePlaceholder')}
                                type="number"
                                name="dailyRentalPrice"
                                value={values.dailyRentalPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.rental}
                              />
                            </LabelPrice>
                            {errors.dailyRentalPrice &&
                              touched.dailyRentalPrice && (
                                <WrapError>
                                  <ErrorMessage>
                                    {t(errors.dailyRentalPrice)}
                                  </ErrorMessage>
                                </WrapError>
                              )}
                            <LabelPrice>
                              {t('Price')} (Kč/hod)
                              <InputPrice
                                placeholder={t('pricePlaceholder')}
                                type="number"
                                name="hourlyRentalPrice"
                                value={values.hourlyRentalPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.rental}
                              />
                            </LabelPrice>
                            {errors.hourlyRentalPrice &&
                              touched.hourlyRentalPrice && (
                                <WrapError>
                                  <ErrorMessage>
                                    {t(errors.hourlyRentalPrice)}
                                  </ErrorMessage>
                                </WrapError>
                              )}
                            <LabelPrice>
                              {t('deposit')} (Kč)
                              <InputPrice
                                placeholder={t('pricePlaceholder')}
                                type="number"
                                name="deposit"
                                value={values.deposit}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.rental}
                              />
                            </LabelPrice>
                            {errors.deposit && touched.deposit && (
                              <WrapError>
                                <ErrorMessage>
                                  {t(errors.hourlyRentalPrice)}
                                </ErrorMessage>
                              </WrapError>
                            )}
                          </WrapCondition>
                          <WrapCondition>
                            <LabelStatus>
                              <Box>{values.sale && <StyledIconCheck />}</Box>
                              {t('Sale')}
                              <Input
                                type="checkbox"
                                name="sale"
                                value={values.sale}
                                onChange={e => {
                                  e.currentTarget.value === 'true' &&
                                    setFieldValue('salePrice', '');
                                  handleChange(e);
                                }}
                                onBlur={handleBlur}
                              />
                            </LabelStatus>
                            <LabelPrice>
                              {t('Price')} (Kč)
                              <InputPrice
                                placeholder={t('pricePlaceholder')}
                                type="number"
                                name="salePrice"
                                value={values.salePrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.sale}
                              />
                            </LabelPrice>
                          </WrapCondition>
                        </GeneralWrap>

                        {errors.rental && touched.rental && (
                          <WrapError>
                            <ErrorMessage>{t(errors.rental)}</ErrorMessage>
                          </WrapError>
                        )}
                      </div>
                      {/* самовивіз */}

                      <div>
                        <Title>{t('pickup')}</Title>
                        {/* <GeneralWrap> */}
                        <WrapCondition>
                          <PlaceAutocomplete
                            value={values.pickupAddress}
                            name="pickupAddress"
                            placeholder={t('address')}
                            onPlaceSelect={pickupAddress =>
                              setFieldValue('pickupAddress', pickupAddress)
                            }
                          />
                          {errors.pickupAddress && touched.pickupAddress && (
                            <WrapError>
                              <ErrorMessage>
                                {t(errors.pickupAddress)}
                              </ErrorMessage>
                            </WrapError>
                          )}
                        </WrapCondition>
                        {/* </GeneralWrap> */}
                      </div>

                      {/* KEYWORDS of Product */}

                      <div>
                        <Title>{t('keywords')}</Title>
                        <Description>{t('labelKeywords')}</Description>

                        <Field
                          type="text"
                          name="keyWord"
                          value={values.keyWord}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder={t('keywordsPlaceholder')}
                        />
                        <TextInstruction>{t('addsKeywords')}</TextInstruction>
                      </div>

                      {/*  AGREE ADD PHOTO of Product */}

                      <LabelStatusAgree>
                        <Box>{values.isAddPhoto && <StyledIconCheck />}</Box>
                        <WrapTextAgree>
                          {t('yourAgree')}
                          <StyledNavLink>{t('linkAgree')}</StyledNavLink>
                        </WrapTextAgree>
                        <Input
                          type="checkbox"
                          name="isAddPhoto"
                          value={values.isAddPhoto}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </LabelStatusAgree>
                    </SectionCondition>
                    <WrapButtons>
                      <WrapBtnAdd>
                        <ButtonSubmit type="submit" disabled={isLoading}>
                          {!isLoading ? (
                            <>
                              {isUpdate ? t('save') : t('addProduct')}
                              {!isUpdate && <IconPlus />}
                            </>
                          ) : (
                            <BeatLoader color="#EBDAD1" />
                          )}
                        </ButtonSubmit>
                      </WrapBtnAdd>
                      <ButtonBack
                        onClick={() => {
                          setStepValue(4);
                        }}
                      >
                        Назад
                      </ButtonBack>
                    </WrapButtons>
                  </>
                )}
              </FormMobile>
            </>
          );
        }}
      </Formik>
      {isOpenModalMaxSize && (
        <ModalAttention
          onClick={() => {
            setIsOpenModalMaxSize(false);
          }}
        />
      )}
    </>
  );
};

export default FormAddProduct;

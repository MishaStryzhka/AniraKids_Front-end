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
import { Map, Marker } from '@vis.gl/react-google-maps';

const api = require('../../../api');

const FormAddProduct = () => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.formAddProduct',
  });

  const [stepValue, setStepValue] = useState(1);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const [photoOrder, setPhotoOrder] = useState([]);

  const [isOpenModalMaxSize, setIsOpenModalMaxSize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ===========

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedPhotoId = e.dataTransfer.getData('text/plain');

    // Отримуємо індекс фотографії, яку перетягували
    const draggedPhotoIndex = photoOrder.findIndex(
      photo => photo === parseInt(draggedPhotoId, 10)
    );

    // Отримуємо індекс фотографії, на яку перетягували
    const targetPhotoIndex = photoOrder.findIndex(
      photo => photo === targetIndex
    );

    // Міняємо місцями фотографії в масиві
    const newOrder = [...photoOrder];

    const el = newOrder[draggedPhotoIndex];
    newOrder.splice(draggedPhotoIndex, 1);
    newOrder.splice(targetPhotoIndex, 0, el);

    setPhotoOrder(newOrder);
  };

  // ===========
  const wrapPhototsRef = useRef(null);

  useEffect(() => {
    const wrapPhotots = wrapPhototsRef.current;

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
  }, []);

  // ===========
  const handleFormSubmit = values => {
    setIsLoading(true);
    api
      .addProduct(values)
      .then(data => {
        setIsLoading(false);
        navigate('/my-account/rent-out', { replace: true });
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Formik
        initialValues={{
          photoUrls: photoOrder.map(i => selectedPhotos[i]),
          category: '',
          videoUrl: '',
          name: '',
          description: '',
          brand: '',
          familyLook: '',
          size: '',
          isPregnancy: '',
          subject: '',
          outfits: '',
          age: '',
          childSize: '',
          decor: '',
          color: '',
          saleOrRental: '',
          rental: '',
          dailyRentalPrice: '',
          hourlyRentalPrice: '',

          sale: '',
          priceSale: '',

          allowPickup: false,
          pickupAddress: '',

          isAddPhoto: '',
          colorCode: '',
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
            const updatedSelectedPhotos = [...selectedPhotos];
            updatedSelectedPhotos.splice(index, 1);
            setSelectedPhotos(updatedSelectedPhotos);

            const updatedPhotoOrder = [...photoOrder];
            updatedPhotoOrder.splice(index, 1);
            setPhotoOrder(
              updatedPhotoOrder.map(el => (el > index ? el - 1 : el))
            );
          };

          const position = { lat: 53.54992, lng: 10.00678 };

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
                      const selectedFiles = Array.from(e.target.files);

                      if (selectedFiles.length + selectedPhotos.length > 10) {
                        setIsOpenModalMaxSize(true);
                        return;
                      }

                      if (selectedFiles.some(file => file.size > 10485760)) {
                        setIsOpenModalMaxSize(true);
                        return;
                      }

                      setTouched({ ...touched, photoUrls: true });
                      setSelectedPhotos([
                        ...photoOrder.map(i => selectedPhotos[i]),
                        ...Array.from(e.target.files).filter(
                          file =>
                            file.type !== 'video/quicktime' &&
                            file.size < 10485760
                        ),
                      ]);
                      setPhotoOrder(
                        [...selectedPhotos, ...Array.from(e.target.files)]
                          .filter(
                            file =>
                              file.type !== 'video/quicktime' &&
                              file.size < 10485760
                          )
                          .map((_, index) => index)
                      );
                      setFieldValue(
                        'photoUrls',
                        [
                          ...photoOrder,
                          ...Array.from(e.target.files)
                            .filter(
                              file =>
                                file.type !== 'video/quicktime' &&
                                file.size < 10485760
                            )
                            .map((_, index) => photoOrder.length - 0 + index),
                        ].map(
                          index =>
                            [
                              ...selectedPhotos,
                              ...Array.from(e.target.files).filter(
                                file =>
                                  file.type !== 'video/quicktime' &&
                                  file.size < 10485760
                              ),
                            ][index]
                        )
                      );
                    }}
                    onBlur={handleBlur}
                    multiple
                  />
                  <Title>{t('Upload photo')}</Title>
                  <WrapperPhotos ref={wrapPhototsRef}>
                    {photoOrder.map((photo, index) => (
                      <WrapPhoto
                        key={photo}
                        draggable
                        onDragStart={e => handleDragStart(e, photo)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          handleDrop(e, photo);
                        }}
                      >
                        <ButtonDeletePhoto
                          onClick={() => handleDeletePhoto(index)}
                        >
                          <IconBasket />
                        </ButtonDeletePhoto>
                        <PhotoImg
                          src={URL.createObjectURL(selectedPhotos[photo])}
                          alt={`photo_${index}`}
                        />
                      </WrapPhoto>
                    ))}
                    {selectedPhotos.length < 10 && (
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
                        $active={values.category === 'women`s category'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setFieldValue('category', 'women`s category');
                        }}
                      >
                        {t("Women's Clothing")}
                      </Button>
                    </li>
                    <li>
                      <Button
                        $active={values.category === 'men`s category'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setFieldValue('category', 'men`s category');
                        }}
                      >
                        {t("Men's Suits")}
                      </Button>
                    </li>
                    <li>
                      <Button
                        $active={values.category === 'children`s category'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setFieldValue('category', 'children`s category');
                        }}
                      >
                        {t("Children's Clothing")}
                      </Button>
                    </li>

                    <li>
                      <Button
                        $active={values.category === 'decoration category'}
                        type="button"
                        onClick={() => {
                          resetInitialValuesForCategories();
                          setFieldValue('category', 'decoration category');
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

                  {/* WOMEN`S CATEGORY / MEN`S CATEGORY */}

                  {(values.category === 'women`s category' ||
                    values.category === 'men`s category') && (
                    <Wrap>
                      <BoxCategory>
                        <WrapCategory>
                          <Description>Family look</Description>
                          <List>
                            {[
                              ...(values.category === 'women`s category'
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
                        {values.category === 'women`s category' && (
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

                  {/* CHILDREN`S CATEGORY */}

                  {values.category === 'children`s category' && (
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

                  {/* DECORATION CATEGORY */}

                  {values.category === 'decoration category' && (
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

                {/* asdasd */}

                <div>
                  <Title> Allow self-pickup</Title>
                  <GeneralWrap>
                    <WrapCondition>
                      <LabelStatus>
                        <Box>{values.allowPickup && <IconCheck />}</Box>
                        Allow self-pickup
                        <Input
                          type="checkbox"
                          name="allowPickup"
                          value={values.allowPickup}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </LabelStatus>
                      <LabelPrice>
                        Pickup address:
                        <InputPrice
                          placeholder="address"
                          type="adress"
                          name="pickupAddress"
                          value={values.pickupAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!values.allowPickup}
                        />
                      </LabelPrice>
                      {errors.pickupAddress && touched.pickupAddress && (
                        <WrapError>
                          <ErrorMessage>{t(errors.pickupAddress)}</ErrorMessage>
                        </WrapError>
                      )}

                      <div style={{ width: 600, height: 400 }}>
                        <Map defaultCenter={position} defaultZoom={10}>
                          <Marker position={position} />
                        </Map>
                      </div>
                    </WrapCondition>
                  </GeneralWrap>
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
                      {t('addItem')}
                      <IconPlus />
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
                            const selectedFiles = Array.from(e.target.files);

                            if (
                              selectedFiles.length + selectedPhotos.length >
                              10
                            ) {
                              // Заборонити вибір більше ніж 10 файлів
                              alert(t('maxFiles'));
                              return;
                            }

                            if (
                              selectedFiles.length + selectedPhotos.length <
                              3
                            ) {
                              // Не менше 3-х файлів
                              alert(t('minFiles'));
                              return;
                            }

                            if (
                              selectedFiles.some(file => file.size > 10485760)
                            ) {
                              alert(t('maxSize'));
                            }

                            setTouched({ ...touched, photoUrls: true });
                            setSelectedPhotos([
                              ...photoOrder.map(i => selectedPhotos[i]),
                              ...Array.from(e.target.files).filter(
                                file =>
                                  file.type !== 'video/quicktime' &&
                                  file.size < 10485760
                              ),
                            ]);
                            setPhotoOrder(
                              [...selectedPhotos, ...Array.from(e.target.files)]
                                .filter(
                                  file =>
                                    file.type !== 'video/quicktime' &&
                                    file.size < 10485760
                                )
                                .map((_, index) => index)
                            );
                            setFieldValue(
                              'photoUrls',
                              [
                                ...photoOrder,
                                ...Array.from(e.target.files)
                                  .filter(
                                    file =>
                                      file.type !== 'video/quicktime' &&
                                      file.size < 10485760
                                  )
                                  .map(
                                    (_, index) => photoOrder.length - 0 + index
                                  ),
                              ].map(
                                index =>
                                  [
                                    ...selectedPhotos,
                                    ...Array.from(e.target.files).filter(
                                      file =>
                                        file.type !== 'video/quicktime' &&
                                        file.size < 10485760
                                    ),
                                  ][index]
                              )
                            );
                          }}
                          onBlur={handleBlur}
                          multiple
                        />
                        <Title>{t('Upload photo')}</Title>
                        <WrapperPhotos ref={wrapPhototsRef}>
                          {photoOrder.map((photo, index) => (
                            <WrapPhoto
                              key={photo}
                              draggable
                              onDragStart={e => handleDragStart(e, photo)}
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => {
                                handleDrop(e, photo);
                              }}
                            >
                              <PhotoImg
                                src={URL.createObjectURL(selectedPhotos[photo])}
                                alt={`photo_${index}`}
                              />
                            </WrapPhoto>
                          ))}
                          {selectedPhotos.length < 10 && (
                            <WrapPhoto htmlFor="photoUrls">
                              <Picture>
                                <IconPhoto />
                                <TextPhoto>{t('Upload photo')}</TextPhoto>
                              </Picture>
                            </WrapPhoto>
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
                            $active={values.category === 'women`s category'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setFieldValue('category', 'women`s category');
                            }}
                          >
                            {t("Women's Clothing")}
                          </Button>
                        </li>
                        <li>
                          <Button
                            $active={values.category === 'men`s category'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setFieldValue('category', 'men`s category');
                            }}
                          >
                            {t("Men's Suits")}
                          </Button>
                        </li>
                        <li>
                          <Button
                            $active={values.category === 'children`s category'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setFieldValue('category', 'children`s category');
                            }}
                          >
                            {t("Children's Clothing")}
                          </Button>
                        </li>
                        <li>
                          <Button
                            $active={values.category === 'decoration category'}
                            type="button"
                            onClick={() => {
                              resetInitialValuesForCategories();
                              setFieldValue('category', 'decoration category');
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
                {/* WOMEN`S CATEGORY / MEN`S CATEGORY */}

                {stepValue === 3 && (
                  <Section>
                    {(values.category === 'women`s category' ||
                      values.category === 'men`s category') && (
                      <Wrap>
                        {values.category === 'women`s category' && (
                          <TitleCategory>{t("Women's Clothing")}</TitleCategory>
                        )}
                        {values.category === 'men`s category' && (
                          <TitleCategory> {t("Men's Suits")}</TitleCategory>
                        )}
                        <BoxCategory>
                          <WrapCategory id="section-familyLook">
                            <Description>Family look</Description>
                            <List>
                              {[
                                ...(values.category === 'women`s category'
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
                          {values.category === 'women`s category' && (
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

                    {/* CHILDREN`S CATEGORY */}

                    {values.category === 'children`s category' && (
                      <Wrap>
                        {values.category === 'children`s category' && (
                          <TitleCategory>
                            {t("Children's Clothing")}
                          </TitleCategory>
                        )}
                        <BoxCategory>
                          <WrapCategory id="section-outfits">
                            <Description>{t('Outfits')}</Description>
                            <List>
                              {arrayOfOutfits.map((valueOutfits, index) => (
                                <Label key={index}>
                                  <Box>
                                    {values.outfits === valueOutfits && (
                                      <StyledIconCheck />
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
                                    $check={values.age === productAge.age}
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
                                      $check={values.childSize === childSize}
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

                    {/* DECORATION CATEGORY */}

                    {values.category === 'decoration category' && (
                      <Wrap>
                        {values.category === 'decoration category' && (
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

                          if (values.category === 'women`s category') {
                            validateField('familyLook');
                            validateField('size');
                            if (errors?.familyLook)
                              newErrors.familyLook = errors.familyLook;
                            if (errors?.isPregnancy)
                              newErrors.isPregnancy = errors.isPregnancy;
                            if (errors?.size) newErrors.size = errors.size;
                          }

                          if (values.category === 'men`s category') {
                            validateField('familyLook');
                            validateField('size');
                            if (errors?.familyLook)
                              newErrors.familyLook = errors.familyLook;
                            if (errors?.size) newErrors.size = errors.size;
                          }

                          if (values.category === 'children`s category') {
                            validateField('outfits');
                            validateField('age');
                            validateField('childSize');
                            if (errors?.outfits)
                              newErrors.outfits = errors.outfits;
                            if (errors?.age) newErrors.age = errors.age;
                            if (errors?.childSize)
                              newErrors.childSize = errors.childSize;
                          }

                          if (values.category === 'decoration category') {
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
                              {t('addItem')}
                              <IconPlus />
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

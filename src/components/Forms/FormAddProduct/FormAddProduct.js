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
  ButtonBack,
  WrapInsideSection,
  WrapLabels,
  TitleCategory,
  SectionCondition,
  LabelStatusAgree,
  WrapTextAgree,
  WrapBtnAdd,
  WrapButtons,
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
        console.log('data', data);
        setIsLoading(false);
        navigate('/my-account/rent-out', { replace: true });
      })
      .catch(error => {
        setIsLoading(false);
        console.log('error', error);
      });
  };

  return (
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
          setFieldValue,
          handleChange,
          handleSubmit,
          handleBlur,
        } = formikProps;

        console.log('errors', errors);

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

        console.log('values', values);

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
                    console.log('e.target.files', e.target.files);

                    const selectedFiles = Array.from(e.target.files);
                    console.log('selectedFiles', selectedFiles);
                    console.log(
                      'selectedFiles.length + selectedPhotos.length',
                      selectedFiles.length + selectedPhotos.length
                    );

                    console.log(selectedPhotos);
                    console.log(selectedPhotos.length);
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
                            <ErrorMessage>{t(errors.familyLook)}</ErrorMessage>
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
                            <ErrorMessage>{t(errors.isPregnancy)}</ErrorMessage>
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
                              <BoxSize $check={values.childSize === childSize}>
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
                          {arrayofDecorProduct.map(({ searchDecor }, index) => (
                            <Label key={index}>
                              <Box>
                                {values.decor === searchDecor && <IconCheck />}
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
                          ))}
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
                            name={color}
                            value={color}
                            onChange={e =>
                              setFieldValue('color', e.currentTarget.value)
                            }
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
                <TextInstruction>{t('descriptionColor')}</TextInstruction>

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
                    {errors.hourlyRentalPrice && touched.hourlyRentalPrice && (
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
                  </WrapInsideSection>
                  <WrapButtons>
                    <ButtonNext
                      onClick={() => {
                        setStepValue(2);
                      }}
                    >
                      {t('btnNext')} 1/4
                    </ButtonNext>
                  </WrapButtons>
                </Section>
              )}
              {stepValue === 2 && (
                <Section>
                  <Title>{t('describeItem')}</Title>
                  <WrapLabels>
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
                      {errors.name && touched.name && (
                        <ErrorMessage>{t(errors.name)}</ErrorMessage>
                      )}
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
                      {errors.description && touched.description && (
                        <ErrorMessage>{t(errors.description)} </ErrorMessage>
                      )}
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

                      {errors.brand && touched.brand && (
                        <ErrorMessage>{t(errors.brand)}</ErrorMessage>
                      )}
                    </LabelDescription>
                  </WrapLabels>
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
                      {errors.category && touched.category && (
                        <ErrorMessage>{t(errors.category)}</ErrorMessage>
                      )}
                    </GeneralList>
                  </div>
                  <WrapButtons>
                    <ButtonNext
                      onClick={() => {
                        setStepValue(3);
                      }}
                    >
                      {t('btnNext')} 2/4
                    </ButtonNext>
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
                          {errors.outfits && touched.outfits && (
                            <ErrorMessage>{t(errors.outfits)}</ErrorMessage>
                          )}
                        </WrapCategory>
                      </BoxCategory>
                      <div>
                        <Title>{t('Age')}</Title>
                        <WrapChildrenParams>
                          {arrayAgeProduct.map(({ age }, index) => (
                            <li key={index}>
                              <LabelChildren>
                                <BoxSize $check={values.age === age}>
                                  {t(age)}
                                </BoxSize>
                                <Input
                                  type="radio"
                                  name="age"
                                  value={age}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
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
                      <div>
                        <Title>{t('Size')}</Title>
                        <WrapChildrenSize>
                          {arraySizeChildrenProduct.map(
                            ({ descriptionSize, childSize }, index) => (
                              <li key={index}>
                                <LabelChildren>
                                  <BoxSize
                                    $check={values.childSize === childSize}
                                  >
                                    {descriptionSize}
                                    {t('sizecm')}
                                  </BoxSize>
                                  <Input
                                    type="radio"
                                    name="childSize"
                                    value={childSize}
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
                      {arrayColorsProduct.map(({ colorCode, color }, index) => (
                        <ItemButton key={index}>
                          <LabelColor>
                            <Input
                              type="radio"
                              name={color}
                              value={color}
                              onChange={e =>
                                setFieldValue('color', e.currentTarget.value)
                              }
                              onBlur={handleBlur}
                            />
                            <WrapBoxColor $check={values.color === color}>
                              <BoxColor color={colorCode} />
                              {t(color)}
                            </WrapBoxColor>
                          </LabelColor>
                        </ItemButton>
                      ))}
                    </ListColor>
                    <TextInstruction>{t('descriptionColor')}</TextInstruction>
                    <WrapError>
                      <ErrorMessage>
                        {errors.color && touched.color && t(errors.color)}
                      </ErrorMessage>
                    </WrapError>
                  </div>
                  <WrapButtons>
                    <ButtonNext
                      onClick={() => {
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
            {isOpenModalMaxSize && (
              <ModalAttention
                onClick={() => {
                  setIsOpenModalMaxSize(false);
                }}
              />
            )}
          </>
        );
      }}
    </Formik>
  );
};

export default FormAddProduct;

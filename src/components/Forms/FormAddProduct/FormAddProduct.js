import IconPhoto from 'images/icons/IconPhoto';
import {
  LabelDescription,
  Field,
  Form,
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
} from './FormAddProduct.styled';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { validationProductSchema } from 'schemas';
import {
  arrayAgeProduct,
  arrayFamilyLookProduct,
  arrayOfToysProduct,
  arrayPregnancyProduct,
  arraySizeChildrenProduct,
  arrayofDecorProduct,
  arrayOfSubjectsProduct,
  arrayColorsProduct,
  arraySizeAdult,
  arrayFamilyLookMen,
} from 'helpers';
import IconCheck from 'images/icons/IconCheck';
import IconPlus from 'images/icons/IconPlus';
import { useTranslation } from 'react-i18next';

const FormAddProduct = () => {
  const [isParamsWoman, setIsParamsWoman] = useState(false);
  const [isParamsMan, setIsParamsMan] = useState(false);
  const [isParamsChildren, setIsParamsChildren] = useState(false);
  const [isParamsDecor, setIsParamsDecor] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoOrder, setPhotoOrder] = useState([]);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formAddProduct',
  });

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

      // Визначте кількість пікселів, на яку буде прокручено за кожен "крок" роліка
      const scrollStep = 50;

      // Прокручуйте вліво або вправо в залежності від напрямку русу роліка
      if (event.deltaY > 0) {
        wrapPhotots.scrollLeft += scrollStep;
      } else {
        wrapPhotots.scrollLeft -= scrollStep;
      }

      // Зупиніть подальше поширення події, якщо ви обробляєте прокрутку
      event.preventDefault();
    };

    wrapPhotots.addEventListener('wheel', handleScroll);

    return () => {
      wrapPhotots.removeEventListener('wheel', handleScroll);
    };
  }, []);

  // ===========
  const handleFormSubmit = values => {
    console.log(values);
  };

  return (
    <Formik
      initialValues={{
        photoUrls: photoOrder.map(i => selectedPhotos[i]),
        videoUrl: '',
        name: '',
        description: '',
        brand: '',
        familyLook: '',
        size: '',
        isPregnancy: '',
        subject: '',
        age: '',
        childSize: '',
        decor: '',
        color: '',
        salePrice: '',
        rentalPrice: '',
        check: '',
      }}
      validationSchema={validationProductSchema}
      onSubmit={handleFormSubmit}
    >
      {e => {
        const {
          values,
          errors,
          touched,
          setTouched,
          setFieldValue,
          handleChange,
          handleSubmit,
        } = e;
        console.log('values', values);

        return (
          <Form onSubmit={handleSubmit}>
            <div>
              <Field
                style={{ display: 'none' }}
                type="file"
                id="photoUrls"
                value=""
                name="photoUrls"
                onChange={e => {
                  const selectedFiles = Array.from(e.target.files);

                  if (selectedFiles.length + selectedPhotos.length > 10) {
                    // Заборонити вибір більше ніж 10 файлів
                    alert('Можна вибрати максимум 10 файлів.');
                    return;
                  }

                  setTouched({ ...touched, photoUrls: true });
                  setSelectedPhotos([
                    ...photoOrder.map(i => selectedPhotos[i]),
                    ...Array.from(e.target.files),
                  ]);
                  setPhotoOrder(
                    [...selectedPhotos, ...Array.from(e.target.files)].map(
                      (_, index) => index
                    )
                  );
                  setFieldValue(
                    'photoUrls',
                    [
                      ...photoOrder,
                      ...Array.from(e.target.files).map(
                        (_, index) => photoOrder.length - 0 + index
                      ),
                    ].map(
                      index =>
                        [...selectedPhotos, ...Array.from(e.target.files)][
                          index
                        ]
                    )
                  );
                }}
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
              <TextInstruction>{t('instruction upload photo')}</TextInstruction>
            </div>
            <div>
              <Title>{t('addVideo')}</Title>
              <LabelDescription>
                {t('labelAddVideo')}
                <Field
                  onChange={handleChange}
                  name="videoUrl"
                  value={values.videoUrl}
                  type="text"
                  placeholder="https://www.youtube.com/watch?..."
                />
                <p>{errors.videoUrl && touched.videoUrl && errors.videoUrl}</p>
              </LabelDescription>
            </div>
            <div>
              <Title>{t('describeItem')}</Title>
              <LabelDescription>
                {t('nameItem')}
                <Field
                  onChange={handleChange}
                  name="name"
                  value={values.name}
                  type="text"
                  placeholder={t('namePlaceholder')}
                />
                <p>{errors.name && touched.name && errors.name}</p>
              </LabelDescription>

              <LabelDescription>
                {t('descriptionItem')}
                <FieldComments
                  onChange={handleChange}
                  name="description"
                  value={values.description}
                  type="text"
                  placeholder={t('descriptionPlaceholder')}
                />
                <p>
                  {errors.description &&
                    touched.description &&
                    errors.description}
                </p>
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
                <p>{errors.brand && touched.brand && errors.brand}</p>
              </LabelDescription>
            </div>
            <div>
              <Title>{t('Choose a category')}</Title>
              <GeneralList>
                <li>
                  <Button
                    $isParamsWoman={isParamsWoman}
                    type="button"
                    onClick={() => {
                      setIsParamsWoman(true);
                      setIsParamsMan(false);
                      setIsParamsChildren(false);
                      setIsParamsDecor(false);
                    }}
                  >
                    {t("Women's Clothing")}
                  </Button>
                </li>
                <li>
                  <Button
                    $isParamsMan={isParamsMan}
                    type="button"
                    onClick={() => {
                      setIsParamsMan(true);
                      setIsParamsWoman(false);
                      setIsParamsChildren(false);
                      setIsParamsDecor(false);
                    }}
                  >
                    {t("Men's Suits")}
                  </Button>
                </li>
                <li>
                  <Button
                    $isParamsChildren={isParamsChildren}
                    type="button"
                    onClick={() => {
                      setIsParamsChildren(true);
                      setIsParamsMan(false);
                      setIsParamsWoman(false);
                      setIsParamsDecor(false);
                    }}
                  >
                    {t("Children's Clothing")}
                  </Button>
                </li>

                <li>
                  <Button
                    $isParamsDecor={isParamsDecor}
                    type="button"
                    onClick={() => {
                      setIsParamsChildren(false);
                      setIsParamsMan(false);
                      setIsParamsWoman(false);
                      setIsParamsDecor(true);
                    }}
                  >
                    {t('Decor and Toys')}
                  </Button>
                </li>
              </GeneralList>
              {isParamsWoman && (
                <Wrap>
                  {/* <Title>{t('Choose a category')}</Title> */}
                  <BoxCategory>
                    <WrapCategory>
                      <Description>Family look</Description>
                      <List>
                        {arrayFamilyLookProduct.map(
                          ({ valueVariant }, index) => (
                            <li key={index}>
                              <Label>
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
                            </li>
                          )
                        )}
                      </List>
                    </WrapCategory>
                    <WrapCategory>
                      <Description>{t('For pregnant women')}</Description>
                      <List>
                        {arrayPregnancyProduct.map(
                          ({ valueVariant }, index) => (
                            <li key={index}>
                              <Label>
                                <Box>
                                  {values.isPregnancy === valueVariant && (
                                    <IconCheck />
                                  )}
                                </Box>
                                {t(valueVariant)}
                                <Input
                                  type="radio"
                                  name="isPregnancy"
                                  value={valueVariant}
                                  onChange={handleChange}
                                />
                              </Label>
                            </li>
                          )
                        )}
                      </List>
                    </WrapCategory>
                  </BoxCategory>
                  <Title>{t('Specify the size')}</Title>
                  <ListHorizont>
                    {arraySizeAdult.map(({ descriptionSize }, index) => (
                      <li key={index}>
                        <LabelSize>
                          <BoxSize $check={values?.size === descriptionSize}>
                            {descriptionSize}
                          </BoxSize>
                          <Input
                            type="radio"
                            name="size"
                            value={descriptionSize}
                            onChange={handleChange}
                          />
                        </LabelSize>
                      </li>
                    ))}
                  </ListHorizont>
                </Wrap>
              )}
              {isParamsMan && (
                <Wrap>
                  {/* <Title>{t('Choose a category')}</Title> */}
                  <WrapCategory $isParamsMan={isParamsMan}>
                    <Description>Family look</Description>
                    <List>
                      {arrayFamilyLookMen.map(({ valueVariant }, index) => (
                        <li key={index}>
                          <Label>
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
                        </li>
                      ))}
                    </List>
                  </WrapCategory>
                  <Title>{t('Specify the size')}</Title>
                  <ListHorizont>
                    {arraySizeAdult.map(({ descriptionSize }, index) => (
                      <li key={index}>
                        <LabelSize>
                          <BoxSize $check={values?.size === descriptionSize}>
                            {descriptionSize}
                          </BoxSize>
                          <Input
                            type="radio"
                            name="size"
                            value={descriptionSize}
                            onChange={handleChange}
                          />
                        </LabelSize>
                      </li>
                    ))}
                  </ListHorizont>
                </Wrap>
              )}
              {isParamsChildren && (
                <Wrap>
                  {/* <Title>{t('Choose a category')}</Title> */}
                  <BoxCategory>
                    <WrapCategory>
                      <Description>{t('Subject')}</Description>
                      <List>
                        {arrayOfSubjectsProduct.map(
                          ({ valueSubject }, index) => (
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
                          )
                        )}
                      </List>
                    </WrapCategory>
                  </BoxCategory>
                  <Title>{t('Age')}</Title>
                  <WrapChildrenParams>
                    {arrayAgeProduct.map(({ valueAge }, index) => (
                      <LabelChildren key={index}>
                        <BoxSize $check={values.age === valueAge}>
                          {t(valueAge)}
                        </BoxSize>
                        <Input
                          type="radio"
                          name="age"
                          value={valueAge}
                          onChange={handleChange}
                        />
                      </LabelChildren>
                    ))}
                  </WrapChildrenParams>
                  <Title>{t('Size')}</Title>
                  <WrapChildrenSize>
                    {arraySizeChildrenProduct.map(
                      ({ descriptionSize, valueSize }, index) => (
                        <LabelChildren key={index}>
                          <BoxSize $check={values.size === valueSize}>
                            {descriptionSize}
                            {t('sizecm')}
                          </BoxSize>

                          <Input
                            type="radio"
                            name="size"
                            value={valueSize}
                            onChange={handleChange}
                          />
                        </LabelChildren>
                      )
                    )}
                  </WrapChildrenSize>
                </Wrap>
              )}
              {isParamsDecor && (
                <Wrap>
                  {/* <Title>{t('Choose a category')}</Title> */}
                  <BoxCategory>
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
                            />
                          </Label>
                        ))}
                      </List>
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
                          //  variantOfToys: 'Роботи і трансформери',
                          // typeOfToys:
                        ))}
                      </List>
                    </WrapCategory>
                  </BoxCategory>
                </Wrap>
              )}
            </div>
            <div>
              <Title>{t('Color')}</Title>
              <ListColor>
                {arrayColorsProduct.map(({ colorCode, color }, index) => (
                  <ItemButton key={index}>
                    <LabelColor color={colorCode}>
                      <Input
                        type="radio"
                        name="color"
                        value={color}
                        onChange={handleChange}
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
            </div>
            <div>
              <Title>{t('title rent-sale')}</Title>
              <GeneralWrap>
                <WrapCondition>
                  <LabelStatus>
                    <Box>{values.rental === 'true' && <IconCheck />}</Box>
                    {t('Rental')}
                    <Input
                      type="radio"
                      name="rental"
                      value="true"
                      onChange={handleChange}
                    />
                  </LabelStatus>
                  <LabelPrice>
                    {t('Price')}
                    <InputPrice
                      placeholder={t('pricePlaceholder')}
                      type="text"
                      name="rentalPrice"
                      value={values.rentalPrice}
                      onChange={handleChange}
                    />
                  </LabelPrice>
                </WrapCondition>
                <WrapCondition>
                  <LabelStatus>
                    <Box>{values.sale === 'true' && <IconCheck />}</Box>
                    {t('Sale')}
                    <Input
                      type="radio"
                      name="sale"
                      value="true"
                      onChange={handleChange}
                    />
                  </LabelStatus>
                  <LabelPrice>
                    {t('Price')}
                    <InputPrice
                      placeholder={t('pricePlaceholder')}
                      type="text"
                      name="salePrice"
                      value={values.salePrice}
                      onChange={handleChange}
                    />
                  </LabelPrice>
                </WrapCondition>
              </GeneralWrap>
            </div>
            <div>
              <Title>{t('keywords')}</Title>
              <Description>{t('labelKeywords')}</Description>

              <Field
                onChange={handleChange}
                name="keyWord"
                value={values.keyWord}
                type="text"
                placeholder={t('keywordsPlaceholder')}
              />
              <TextInstruction>{t('addsKeywords')}</TextInstruction>
            </div>
            <LabelStatus>
              <Box>{values.check === 'true' && <IconCheck />}</Box>
              {t('yourAgree')}
              <StyledNavLink>{t('linkAgree')}</StyledNavLink>
              <Input
                type="radio"
                name="check"
                value="true"
                onChange={handleChange}
              />
            </LabelStatus>
            <ButtonSubmit type="submit">
              {t('addItem')}
              <IconPlus />
            </ButtonSubmit>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FormAddProduct;

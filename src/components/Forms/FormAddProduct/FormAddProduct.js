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
} from './FormAddProduct.styled';
import { Formik } from 'formik';
import { useState } from 'react';
import { arraySizeAdult } from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
// import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
// import FilterAge from 'components/Filters/FilterAge/FilterAge';
import { validationProductSchema } from 'schemas';
import {
  ArrayAgeProduct,
  ArrayFamilyLookProduct,
  ArrayPregnancyProduct,
  ArraySizeChildrenProduct,
  arrayOfSubjectsProduct,
  colorsProduct,
} from 'allDates';

const FormAddProduct = () => {
  const [isParamsWoman, setIsParamsWoman] = useState(false);
  const [isParamsMan, setIsParamsMan] = useState(false);
  const [isParamsChildren, setIsParamsChildren] = useState(false);

  const handleFormSubmit = values => {
    console.log(values);
  };
  return (
    <Formik
      initialValues={{
        photoUrl: '',
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
        color: '',
        salePrice: '',
        rentalPrice: '',
      }}
      validationSchema={validationProductSchema}
      onSubmit={handleFormSubmit}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <div>
            <Title>ЗАВАНТАЖТЕ ФОТО</Title>
            <WrapPhoto>
              <Picture>
                <IconPhoto />
                <TextPhoto>Завантажте фото</TextPhoto>
              </Picture>
            </WrapPhoto>
            <TextInstruction>
              Ви можете змінити порядок фотографій, переміщаючи їх між собою
            </TextInstruction>
          </div>
          <div>
            <Title>ДОДАЙТЕ ВІДЕО ОГЛЯД</Title>
            <LabelDescription>
              Ви можете додати відео огляд на річ с youtube.
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
            <Title>ОПИШІТЬ ВАШУ РІЧ</Title>
            <LabelDescription>
              Назва (українською мовою)
              <Field
                onChange={handleChange}
                name="name"
                value={values.name}
                type="text"
                placeholder="Наприклад: Сукня H&M"
              />
              <p>{errors.name && touched.name && errors.name}</p>
            </LabelDescription>

            <LabelDescription>
              Опис (українською мовою)
              <FieldComments
                onChange={handleChange}
                name="description"
                value={values.description}
                type="text"
                placeholder="Наприклад: В цій сукні ви виглядатиме як зірка"
              />
              <p>
                {errors.description &&
                  touched.description &&
                  errors.description}
              </p>
            </LabelDescription>

            <LabelDescription>
              Бренд
              <Field
                onChange={handleChange}
                name="brand"
                value={values.brand}
                type="text"
                placeholder="Наприклад: H&M"
              />
              <p>{errors.brand && touched.brand && errors.brand}</p>
            </LabelDescription>
          </div>
          <div>
            <Title>ВИБЕРІТЬ РОЗДІЛ</Title>
            <GeneralList>
              <li>
                <Button
                  $isParamsWoman={isParamsWoman}
                  type="button"
                  onClick={() => {
                    setIsParamsWoman(true);
                    setIsParamsMan(false);
                    setIsParamsChildren(false);
                  }}
                >
                  ЖІНОЧІ НАРЯДИ
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  onClick={() => {
                    setIsParamsMan(true);
                    setIsParamsWoman(false);
                  }}
                >
                  ЧОЛОВІЧІ КОСТЮМИ
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  onClick={() => {
                    setIsParamsChildren(true);
                    setIsParamsMan(false);
                    setIsParamsWoman(false);
                  }}
                >
                  ДИТЯЧІ НАРЯДИ
                </Button>
              </li>

              <li>
                <Button
                  type="button"
                  onClick={() => {
                    setIsParamsChildren(false);
                    setIsParamsMan(false);
                    setIsParamsWoman(false);
                  }}
                >
                  ДЕКОР ТА ІГРАШКИ
                </Button>
              </li>
            </GeneralList>
            {isParamsWoman && (
              <Wrap>
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <BoxCategory>
                  <WrapCategory>
                    <Description>Family look</Description>
                    <List>
                      {ArrayFamilyLookProduct.map(
                        ({ valueVariant, variantOfFamilyLook }, index) => (
                          <li key={index}>
                            <label>
                              {variantOfFamilyLook}
                              <Input
                                type="radio"
                                name="familyLook"
                                value={valueVariant}
                                onChange={handleChange}
                              />
                            </label>
                          </li>
                        )
                      )}
                    </List>
                  </WrapCategory>
                  <WrapCategory>
                    <Description>Для вагітних</Description>
                    <List>
                      {ArrayPregnancyProduct.map(
                        ({ valueVariant, isPregnancy }, index) => (
                          <li key={index}>
                            <label>
                              {isPregnancy}
                              <Input
                                type="radio"
                                name="isPregnancy"
                                value={valueVariant}
                                onChange={handleChange}
                              />
                            </label>
                          </li>
                        )
                      )}
                    </List>
                  </WrapCategory>
                </BoxCategory>
                <Title>ВКАЖІТЬ РОЗМІР</Title>
                <ListHorizont>
                  {arraySizeAdult.map(({ descriptionSize }, index) => (
                    <li key={index}>
                      <LabelSize>
                        {descriptionSize}
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
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <WrapCategory $isParamsMan={isParamsMan}>
                  <Description>Family look</Description>
                  <List>
                    {ArrayFamilyLookProduct.map(
                      ({ valueSubject, variantOfFamilyLook }, index) => (
                        <li key={index}>
                          <label>
                            {variantOfFamilyLook}
                            <Input
                              type="radio"
                              name="familyLook"
                              value={valueSubject}
                              onChange={handleChange}
                            />
                          </label>
                        </li>
                      )
                    )}
                  </List>
                </WrapCategory>
                <Title>ВКАЖІТЬ РОЗМІР</Title>
                <ListHorizont>
                  {arraySizeAdult.map(({ descriptionSize }, index) => (
                    <li key={index}>
                      <LabelSize>
                        {descriptionSize}
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
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <BoxCategory>
                  <WrapCategory>
                    <Description>Тематика</Description>
                    <List>
                      {arrayOfSubjectsProduct.map(
                        ({ valueSubject, variantOfSubjects }, index) => (
                          <li key={index}>
                            <label>
                              {variantOfSubjects}
                              <Input
                                type="radio"
                                name="subject"
                                value={valueSubject}
                                onChange={handleChange}
                              />
                            </label>
                          </li>
                        )
                      )}
                    </List>
                  </WrapCategory>
                </BoxCategory>
                <Title>ВКАЖІТЬ ВІК</Title>
                <WrapChildrenSize>
                  {ArrayAgeProduct.map(
                    ({ valueAge, descriptionAge }, index) => (
                      <li key={index}>
                        <LabelSize>
                          {descriptionAge}
                          <Input
                            type="radio"
                            name="age"
                            value={valueAge}
                            onChange={handleChange}
                          />
                        </LabelSize>
                      </li>
                    )
                  )}
                </WrapChildrenSize>
                <Title>ВКАЖІТЬ РОЗМІР</Title>
                <WrapChildrenSize>
                  {ArraySizeChildrenProduct.map(
                    ({ descriptionSize, valueSize }, index) => (
                      <li key={index}>
                        <LabelSize>
                          {descriptionSize}см
                          <Input
                            type="radio"
                            name="size"
                            value={valueSize}
                            onChange={handleChange}
                          />
                        </LabelSize>
                      </li>
                    )
                  )}
                </WrapChildrenSize>
              </Wrap>
            )}
          </div>
          <div>
            <Title>ВИБЕРІТЬ КОЛІР</Title>
            <ListColor>
              {colorsProduct.map(({ nameColor, colorCode, color }, index) => (
                <ItemButton key={index}>
                  <LabelColor color={colorCode}>
                    <Input
                      type="radio"
                      name="color"
                      value={color}
                      onChange={handleChange}
                    />
                    <BoxColor color={colorCode} />
                    {nameColor}
                  </LabelColor>
                </ItemButton>
              ))}
            </ListColor>
          </div>
          <div>
            <Title>УМОВИ ОРЕНДИ / ПРОДАЖУ</Title>
            <GeneralWrap>
              <WrapCondition>
                <LabelStatus>
                  <Box />
                  Оренда
                  <Input
                    type="radio"
                    name="rental"
                    value="true"
                    onChange={handleChange}
                  />
                </LabelStatus>
                <LabelPrice>
                  Ціна
                  <InputPrice
                    placeholder="1500 грн"
                    type="text"
                    name="rentalPrice"
                    value={values.rentalPrice}
                    onChange={handleChange}
                  />
                </LabelPrice>
              </WrapCondition>
              <WrapCondition>
                <LabelStatus>
                  <Box />
                  Продаж
                  <Input
                    type="radio"
                    name="sale"
                    value="true"
                    onChange={handleChange}
                  />
                </LabelStatus>
                <LabelPrice>
                  Ціна
                  <InputPrice
                    placeholder="1500 грн"
                    type="text"
                    name="salePrice"
                    value={values.salePrice}
                    onChange={handleChange}
                  />
                </LabelPrice>
              </WrapCondition>
            </GeneralWrap>
          </div>
          <button type="submit">Додати товар</button>
        </Form>
      )}
    </Formik>
  );
};

export default FormAddProduct;

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
} from './FormAddProduct.styled';
import { Formik } from 'formik';
import { useState } from 'react';
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
} from 'helpers';
import IconCheck from 'images/icons/IconCheck';
import IconPlus from 'images/icons/IconPlus';

const FormAddProduct = () => {
  const [isParamsWoman, setIsParamsWoman] = useState(false);
  const [isParamsMan, setIsParamsMan] = useState(false);
  const [isParamsChildren, setIsParamsChildren] = useState(false);
  const [isParamsDecor, setIsParamsDecor] = useState(false);

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
        decor: '',
        color: '',
        salePrice: '',
        rentalPrice: '',
        check: '',
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
                    setIsParamsDecor(false);
                  }}
                >
                  ЖІНОЧІ НАРЯДИ
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
                  ЧОЛОВІЧІ КОСТЮМИ
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
                  ДИТЯЧІ НАРЯДИ
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
                      {arrayFamilyLookProduct.map(
                        ({ valueVariant, variantOfFamilyLook }, index) => (
                          <li key={index}>
                            <Label>
                              <Box>
                                {values.familyLook === valueVariant && (
                                  <IconCheck />
                                )}
                              </Box>
                              {variantOfFamilyLook}
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
                    <Description>Для вагітних</Description>
                    <List>
                      {arrayPregnancyProduct.map(
                        ({ valueVariant, isPregnancy }, index) => (
                          <li key={index}>
                            <Label>
                              <Box>
                                {values.isPregnancy === valueVariant && (
                                  <IconCheck />
                                )}
                              </Box>
                              {isPregnancy}
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
                <Title>ВКАЖІТЬ РОЗМІР</Title>
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
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <WrapCategory $isParamsMan={isParamsMan}>
                  <Description>Family look</Description>
                  <List>
                    {arrayFamilyLookProduct.map(
                      ({ valueVariant, variantOfFamilyLook }, index) => (
                        <li key={index}>
                          <Label>
                            <Box>
                              {values.familyLook === valueVariant && (
                                <IconCheck />
                              )}
                            </Box>
                            {variantOfFamilyLook}
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
                <Title>ВКАЖІТЬ РОЗМІР</Title>
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
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <BoxCategory>
                  <WrapCategory>
                    <Description>Тематика</Description>
                    <List>
                      {arrayOfSubjectsProduct.map(
                        ({ valueSubject, variantOfSubjects }, index) => (
                          <Label key={index}>
                            <Box>
                              {values.subject === valueSubject && <IconCheck />}
                            </Box>
                            {variantOfSubjects}
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
                <Title>ВКАЖІТЬ ВІК</Title>
                <WrapChildrenParams>
                  {arrayAgeProduct.map(
                    ({ valueAge, descriptionAge }, index) => (
                      <LabelChildren key={index}>
                        <BoxSize $check={values.age === valueAge}>
                          {descriptionAge}
                        </BoxSize>
                        <Input
                          type="radio"
                          name="age"
                          value={valueAge}
                          onChange={handleChange}
                        />
                      </LabelChildren>
                    )
                  )}
                </WrapChildrenParams>
                <Title>ВКАЖІТЬ РОЗМІР</Title>
                <WrapChildrenSize>
                  {arraySizeChildrenProduct.map(
                    ({ descriptionSize, valueSize }, index) => (
                      <LabelChildren key={index}>
                        <BoxSize $check={values.size === valueSize}>
                          {descriptionSize}см
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
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <BoxCategory>
                  <WrapCategory>
                    <Description>Декор</Description>
                    <List>
                      {arrayofDecorProduct.map(
                        ({ variantOfDecor, searchDecor }, index) => (
                          <Label key={index}>
                            <Box>
                              {values.decor === searchDecor && <IconCheck />}
                            </Box>
                            {variantOfDecor}
                            <Input
                              type="radio"
                              name="decor"
                              value={searchDecor}
                              onChange={handleChange}
                            />
                          </Label>
                        )
                      )}
                    </List>
                  </WrapCategory>
                  <WrapCategory>
                    <Description>Іграшки</Description>
                    <List>
                      {arrayOfToysProduct.map(
                        ({ variantOfToys, typeOfToys }, index) => (
                          <Label key={index}>
                            <Box>
                              {values.toys === typeOfToys && <IconCheck />}
                            </Box>
                            {variantOfToys}
                            <Input
                              type="radio"
                              name="toys"
                              value={typeOfToys}
                              onChange={handleChange}
                            />
                          </Label>
                          //  variantOfToys: 'Роботи і трансформери',
                          // typeOfToys:
                        )
                      )}
                    </List>
                  </WrapCategory>
                </BoxCategory>
              </Wrap>
            )}
          </div>
          <div>
            <Title>ВИБЕРІТЬ КОЛІР</Title>
            <ListColor>
              {arrayColorsProduct.map(
                ({ nameColor, colorCode, color }, index) => (
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
                        {nameColor}
                      </WrapBoxColor>
                    </LabelColor>
                  </ItemButton>
                )
              )}
            </ListColor>
            <TextInstruction>
              Ви можете обрати до двох відтінків
            </TextInstruction>
          </div>
          <div>
            <Title>УМОВИ ОРЕНДИ / ПРОДАЖУ</Title>
            <GeneralWrap>
              <WrapCondition>
                <LabelStatus>
                  <Box>{values.rental === 'true' && <IconCheck />}</Box>
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
                  <Box>{values.sale === 'true' && <IconCheck />}</Box>
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
          <div>
            <Title>КЛЮЧОВІ СЛОВА</Title>
            <Description>
              Введіть ключові слова через кому або Enter. За ними також будуть
              знаходити ваш товар
            </Description>

            <Field
              onChange={handleChange}
              name="keyWord"
              value={values.keyWord}
              type="text"
              placeholder="Введіть ключові слова"
            />
            <TextInstruction>
              Наприклад слова, такі як: сукня, сукня H&M, червона сукня горошок
            </TextInstruction>
          </div>
          <LabelStatus>
            <Box>{values.check === 'true' && <IconCheck />}</Box>Я додав (-ла)
            як мінімум одне фото речі, яке зробив (-ла) сам (-а).
            <StyledNavLink>Чому це важливо?</StyledNavLink>
            <Input
              type="radio"
              name="check"
              value="true"
              onChange={handleChange}
            />
          </LabelStatus>
          <ButtonSubmit type="submit">
            ДОДАТИ ТОВАР
            <IconPlus />
          </ButtonSubmit>
        </Form>
      )}
    </Formik>
  );
};

export default FormAddProduct;

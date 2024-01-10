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
  ListSize,
  // ButtonSize,
  WrapCategory,
  Description,
  BoxCategory,
  Wrap,
  ButtonVariant,
  ButtonColor,
  ItemButton,
  ListColor,
  Input,
} from './FormAddProduct.styled';
import { Formik } from 'formik';
import { useState } from 'react';
import { arraySizeAdult } from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
import { nanoid } from '@reduxjs/toolkit';
import FilterAge from 'components/Filters/FilterAge/FilterAge';
import { arrayOfSubjects } from 'components/Filters/FilterSubject/FilterSubject';
import { validationProductSchema } from 'schemas';
import { colors } from 'components/Filters/FilterColor/FilterColor';

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
        // familyLook1: '',
        size: '',
        isPregnancy: '',
        subject: '',
        age: '',
        childSize: '',
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
                // id="videoUrl"
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
                // id="name"
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
                // id="description"
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
                    <label>
                      <input
                        type="radio"
                        name="familyLook"
                        value="all-family"
                        onChange={handleChange}
                      />
                      Так, для всієї сім’ї
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="familyLook"
                        value="yes-and-girl"
                        onChange={handleChange}
                      />
                      Так + дівчинка
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="familyLook"
                        value="yes-and-boy"
                        onChange={handleChange}
                      />
                      Так + хлопчик
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="familyLook"
                        value="no"
                        onChange={handleChange}
                      />
                      Ні
                    </label>
                  </WrapCategory>
                  <WrapCategory>
                    <Description>Для вагітних</Description>
                    <label>
                      <input
                        type="radio"
                        name="isPregnancy"
                        value="yes"
                        onChange={handleChange}
                      />
                      Так
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isPregnancy"
                        value="no"
                        onChange={handleChange}
                      />
                      Ні
                    </label>
                    {/* <label>
                      <input
                        type="radio"
                        name="familyLook1"
                        value="all-family"
                        onChange={handleChange}
                      />
                      Так, для всієї сім’ї
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="familyLook1"
                        value="yes-and-girl"
                        onChange={handleChange}
                      />
                      Так + дівчинка
                    </label> */}
                  </WrapCategory>
                </BoxCategory>
                <Title>ВКАЖІТЬ РОЗМІР</Title>
                {/* <ul>
                  <li>
                    <label>
                      S
                      <input
                        type="radio"
                        name="size"
                        value="S"
                        onChange={handleChange}
                      />
                    </label>
                  </li>
                  <li>
                    {' '}
                    <label>
                      M
                      <input
                        type="radio"
                        name="size"
                        value="M"
                        onChange={handleChange}
                      />
                    </label>
                  </li>
                  <li>
                    <label>
                      L
                      <input
                        type="radio"
                        name="size"
                        value="L"
                        onChange={handleChange}
                      />
                    </label>
                  </li>
                </ul> */}

                <ListSize>
                  {arraySizeAdult.map(({ descriptionSize }) => (
                    <li key={nanoid()}>
                      {/* <ButtonSize onChange={handleChange}>
                        {descriptionSize}
                      </ButtonSize> */}
                      <label>
                        {descriptionSize}
                        <Input
                          type="radio"
                          name="size"
                          value={descriptionSize}
                          onChange={handleChange}
                        />
                      </label>
                    </li>
                  ))}
                </ListSize>
              </Wrap>
            )}
            {isParamsMan && (
              <Wrap>
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <WrapCategory $isParamsMan={isParamsMan}>
                  <Description>Family look</Description>
                  <label>
                    <input type="radio" name="color" value="red" />
                    Так, для всієї сім’ї
                  </label>
                  <label>
                    <input type="radio" name="color" value="white" />
                    Так + дівчинка
                  </label>
                  <label>
                    <input type="radio" name="color" value="green" />
                    Так + хлопчик
                  </label>
                  <label>
                    <input type="radio" name="color" value="green" />
                    Ні
                  </label>
                </WrapCategory>
                <Title>ВКАЖІТЬ РОЗМІР</Title>
                <ListSize>
                  {arraySizeAdult.map(({ descriptionSize }) => (
                    <li key={nanoid()}>
                      <label>
                        {descriptionSize}
                        <Input
                          type="radio"
                          name="size"
                          value={descriptionSize}
                          onChange={handleChange}
                        />
                      </label>
                    </li>
                  ))}
                </ListSize>
              </Wrap>
            )}
            {isParamsChildren && (
              <Wrap>
                <Title>ОБЕРІТЬ КАТЕГОРІЮ</Title>
                <BoxCategory>
                  <WrapCategory>
                    <Description>Тематика</Description>
                    <ul>
                      {arrayOfSubjects.map(
                        ({ id, variantOfSubjects, searchSubjects }) => (
                          <li key={id}>
                            <ButtonVariant>{variantOfSubjects}</ButtonVariant>
                          </li>
                        )
                      )}
                    </ul>
                  </WrapCategory>
                </BoxCategory>
                <Title>ВКАЖІТЬ ВІК І РОЗМІР</Title>
                <FilterAge />
                <FilterSizeChildren />
              </Wrap>
            )}
          </div>
          <div>
            <Title>ВИБЕРІТЬ КОЛІР</Title>
            <ListColor>
              {colors.map(({ color, nameColor, colorCode }) => (
                <ItemButton key={nanoid()}>
                  <ButtonColor color={colorCode}>{nameColor}</ButtonColor>
                </ItemButton>
              ))}
            </ListColor>
          </div>
          <div>
            <Title>УМОВИ ОРЕНДИ / ПРОДАЖУ</Title>
          </div>
          <button type="submit">Додати товар</button>
        </Form>
      )}
    </Formik>
  );
};

export default FormAddProduct;

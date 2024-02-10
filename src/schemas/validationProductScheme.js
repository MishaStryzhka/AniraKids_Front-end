import * as Yup from 'yup';

const categoryOptions = [
  'women`s category',
  'men`s category',
  'children`s category',
  'decoration category',
];

const subjectOptions = [
  'Christmas',
  'Ukrainian-symbols',
  'Animals',
  'ballet-&-princesses',
  'Dinosaurs',
  'Flowers-&-butterflies',
  'Hearts',
  'unicors-&-rainbows',
];

export const validationProductSchema = Yup.object().shape({
  videoUrl: Yup.string().matches(
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/,
    'valid video URL'
  ),
  name: Yup.string()
    .required('Required field')
    .min(3, 'minLongText')
    .max(50, 'maxLongText'),
  description: Yup.string()
    .required('Required field')
    .min(3, 'minLongText')
    .max(300, 'maxLongComments'),
  brend: Yup.string().min(3, 'minLongText').max(50, 'maxLongText'),

  category: Yup.string()
    .required('Required category')
    .oneOf(categoryOptions, 'Invalid category'),

  familyLook: Yup.string(),

  isPregnancy: Yup.boolean(),

  subject: Yup.string().test('required', 'Required field', function (value) {
    const category = this.parent.category;
    if (category === 'children`s category') {
      return subjectOptions.includes(value);
    } else {
      return true;
    }
  }),

  size: Yup.string().test('required-size', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'women`s category' || category === 'men`s category'
      ? !!value
      : true;
  }),

  color: Yup.string().required('Required field'),

  age: Yup.string().test('required', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'children`s category' ? !!value : true;
  }),

  childSize: Yup.string().test('required', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'children`s category' ? !!value : true;
  }),

  decor: Yup.string(),

  toys: Yup.string().test('required', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'decoration category' ? !!value : true;
  }),

  rental: Yup.boolean().test(
    'at-least-one',
    'Select at least one type of service',
    function (value) {
      const sale = this.parent.sale;
      return value || sale;
    }
  ),

  sale: Yup.boolean(),

  rentalPrice: Yup.number().test(
    'required',
    'Required field',
    function (value) {
      return this.parent.rental ? !!value : true;
    }
  ),

  salePrice: Yup.number().test('required', 'Required field', function (value) {
    return this.parent.sale ? !!value : true;
  }),

  keyWord: Yup.string(),

  isAddPhoto: Yup.string().required('Required field'),

  brand: Yup.string(),
});

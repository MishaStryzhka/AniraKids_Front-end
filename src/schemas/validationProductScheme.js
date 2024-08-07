import * as Yup from 'yup';

const categoryOptions = [
  'forWomen', // 'women`s category'
  'forMen', // 'men`s category'
  'forChildren', // 'children`s category'
  'decorAndToys', // 'decoration category'
];

// eslint-disable-next-line no-unused-vars
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

const FILE_SIZE_LIMIT = 10 * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'];

export const validationProductSchema = Yup.object().shape({
  photoUrls: Yup.array()
    .of(
      Yup.mixed()
        .test('fileSize', 'fileSize', value => {
          if (value?.path) return true;
          return !value || (value && value.file.size <= FILE_SIZE_LIMIT);
        })
        .test('fileFormat', 'fileFormat', value => {
          if (value?.path) return true;
          return (
            !value || (value && SUPPORTED_FORMATS.includes(value.file.type))
          );
        })
    )
    .required('requiredFileSelection')
    .min(1, 'minimumFileSelection')
    .max(10, 'maximumFileSelection'),
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

  subject: Yup.string(),

  outfits: Yup.string(),

  size: Yup.string().test('required-size', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'women`s category' || category === 'men`s category'
      ? !!value
      : true;
  }),

  color: Yup.string().required('Required field'),

  age: Yup.array().test('required', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'children`s category' ? !!value : true;
  }),

  childSize: Yup.array().test('required', 'Required field', function (value) {
    const category = this.parent.category;
    return category === 'children`s category' ? !!value : true;
  }),

  decor: Yup.string(),

  toys: Yup.string(),

  rental: Yup.boolean().test(
    'at-least-one',
    'Select at least one type of service',
    function (value) {
      const sale = this.parent.sale;
      return value || sale;
    }
  ),

  sale: Yup.boolean(),
  dailyRentalPrice: Yup.number().test(
    'required',
    'Required field',
    function (value) {
      return this.parent.rental ? !!value : true;
    }
  ),
  hourlyRentalPrice: Yup.number().test(
    'required',
    'Required field',
    function (value) {
      return this.parent.rental ? !!value : true;
    }
  ),
  deposit: Yup.number().test('required', 'Required field', function (value) {
    return this.parent.rental ? !!value : true;
  }),

  salePrice: Yup.number().test('required', 'Required field', function (value) {
    return this.parent.sale ? !!value : true;
  }),

  keyWord: Yup.string(),

  isAddPhoto: Yup.string().required('Required field'),

  brand: Yup.string(),
});

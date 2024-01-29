import * as Yup from 'yup';

export const validationProductSchema = Yup.object().shape({
  videoUrl: Yup.string()
    .required('Required field')
    .matches(
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

  section: Yup.string().required('Required section'),

  color: Yup.string().required('Required field'),

  familyLook: Yup.string().test('required', 'Required field', function (value) {
    return this.parent.category === 'women`s category'
      ? !!value
      : '' || this.parent.category === 'men`s category'
      ? !!value
      : '';
  }),

  isPregnancy: Yup.string().test(
    'required',
    'Required field',
    function (value) {
      return this.parent.category === 'women`s category' ? !!value : true;
    }
  ),

  size: Yup.string().test('required', 'Required field', function (value) {
    return this.parent.category === 'women`s category'
      ? !!value
      : '' || this.parent.category === 'men`s category'
      ? !!value
      : '';

    // return this.parent.section === 'women`s category' && !value
    //   ? false
    //   : this.parent.section === 'men`s category' && !value
    //   ? false
    //   : this.parent.section === 'children`s category' && !value
    //   ? false
    //   : true;
  }),

  // childSize: Yup.string().test('required', 'Required field', function (value) {
  //   return this.parent.section === 'children`s category'
  //     ? !!value
  //     : !!value === '';
  // }),

  // subject: Yup.string().test('required', 'Required field', function (value) {
  //   return this.parent.section === 'children`s category'
  //     ? !!value
  //     : !!value === '';
  // }),

  // age: Yup.string().test('required', 'Required field', function (value) {
  //   return this.parent.section === 'children`s category'
  //     ? !!value
  //     : !!value === '';
  // }),

  decor: Yup.string().test('required', 'Required field', function (value) {
    // Ваша умова тут. Наприклад:
    return this.parent.category === 'decoration category' ? !!value : '';
  }),

  toys: Yup.string().test('required', 'Required field', function (value) {
    // Ваша умова тут. Наприклад:
    return this.parent.category === 'decoration category' ? !!value : '';
  }),

  // familyLookMen: Yup.string().test(
  //   'requiredForMenCategory',
  //   'Required field',
  //   function (value) {
  //     // Ваша умова тут. Наприклад:
  //     return this.parent.section === 'men`s category' ? !!value : true;
  //   }
  // ),

  // familyLookWoman: Yup.string().when('section', {
  //   is: section => section === 'women`s category',
  //   then: Yup.string().required("Обов'язкове поле для жіночої категорії"),
  // }),

  // size: Yup.string().when(['section', 'size'], {
  //   is: (section, size) => section === 'women`s category' && !size,
  //   then: Yup.string().required("Обов'язкове поле для жіночої категорії"),
  // }),

  // isPregnancy: Yup.string().when(['section', 'isPregnancy'], {
  //   is: (section, isPregnancy) =>
  //     section === 'women`s category' && !isPregnancy,
  //   then: Yup.string().required("Обов'язкове поле для жіночої категорії"),
  // }),

  // familyLookWoman: Yup.string().test('Required field', function (value) {
  //   return this.resolve(
  //     value !== '' && this.parent.section === 'women`s category'
  //     // this.parent.familyLookWoman === 'valueVariant'
  //   );
  // }),

  // isPregnancy: Yup.string().test(
  //   'Required field',
  //   'Required field',
  //   function (value) {
  //     return this.resolve(
  //       value !== '' && this.parent.section === 'women`s category'
  //       // this.parent.isPregnancy === 'valueVariant'
  //     );
  //   }
  // ),

  // size: Yup.string().test('Required field', 'Required field', function (value) {
  //   return this.resolve(
  //     value !== '' && this.parent.section === 'women`s category'
  //     // this.parent.size === 'descriptionSize'
  //   );
  // }),

  // decor: Yup.string().test(
  //   'Required field',
  //   'Required field',
  //   function (value) {
  //     return this.resolve(this.parent.section === 'decoration category');
  //   }
  // ),

  // toys: Yup.string().test('Required field', 'Required field', function (value) {
  //   return this.resolve(this.parent.section === 'decoration category');
  // }),

  // saleOrRental: Yup.string().required('Required field'),

  // price: Yup.string().test('required', 'Required field', function (value) {
  //   if (this.parent.saleOrRental === 'sale') {
  //     return !!value;
  //   }

  //   if (this.parent.saleOrRental === 'rent') {
  //     return !!value;
  //   }
  // }),
});

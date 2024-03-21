const darktheme = {
  mainColor1: '#FFF',
  mainColor2: '#C6A58D',
  mainColor3: '#77695E',
  mainColor4: '#303130',
  mainColor5: '#000',

  // +
  additionalColorMain3: '#6C6158',

  additionalColorGray: '#EFEFEF',
  additionalColorBrown: '#EBDAD1',
  additionalColorRed: '#ad0000',
  additionalSecondColorRed: '#f3d9d9',
  additionalColorGreen: '#00542c',
  additionalSecondColorGreen: '#D9E6E0',
  // primary: '#FFC107',
  // secondary: '#111111',
  btnColorBG: '#77695e',
  lightBGColor: '#EBDAD1',
};

const lightTheme = {
  mainColor1: '#FFF',
  mainColor2: '#C6A58D',
  mainColor3: '#77695E',
  mainColor4: '#303130',
  mainColor5: '#000',

  // +
  additionalColorMain3: '#6C6158',
  additionalSecondColorRed: '#f3d9d9',
  additionalColorGray: '#EFEFEF',
  additionalColorBrown: '#EBDAD1',
  additionalColorRed: '#ad0000',
  additionalColorGreen: '#00542c',
  additionalSecondColorGreen: '#D9E6E0',
  // primary: '#FFC107',
  // secondary: '#111111',
  btnColorBG: '#77695e',
  lightBGColor: '#EBDAD1',
};

const defaultTheme = {
  boxShadow: '3px 8px 14px 0px #EBDAD150',
  boxShadowHover: '7px 13px 14px 0px #EBDAD170',
};

const theme = {
  dark: {
    color: darktheme,
    ...defaultTheme,
  },
  light: {
    color: lightTheme,
    ...defaultTheme,
  },
};

export default theme;

const darktheme = {
  mainColor1: '#FFF',
  mainColor2: '#C6A58D',
  mainColor3: '#6C6158',
  mainColor4: '#303130',
  mainColor5: '#000',
  additionalColorGray: '#EFEFEF',
  additionalColorBrown: '#EBDAD1',
  additionalColorRed: '#ad0000',
  additionalColorGreen: '#00542c',

  // primary: '#FFC107',
  // secondary: '#111111',
  btnColorBG: '#77695e',
  lightBGColor: '#EBDAD1',
};

const lightTheme = {
  mainColor1: '#FFF',
  mainColor2: '#C6A58D',
  mainColor3: '#6C6158',
  mainColor4: '#303130',
  mainColor5: '#000',
  additionalColorGray: '#EFEFEF',
  additionalColorBrown: '#EBDAD1',
  additionalColorRed: '#ad0000',
  additionalColorGreen: '#00542c',
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

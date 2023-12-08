const darktheme = {
  // primary: '#FFC107',
  // secondary: '#111111',
};

const lightTheme = {
  // primary: '#FFC107',
  // secondary: '#111111',
};

const defaultTheme = {
  boxShadow: '3px 8px 14px 0px #88C6FD30',
  boxShadowHover: '7px 13px 14px 0px #74B1E83D',
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

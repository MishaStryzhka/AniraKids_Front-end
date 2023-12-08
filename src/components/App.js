import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { Route, Routes } from 'react-router-dom';
import SharedLayout from './SharedLayout/SharedLayout';
import {
  AboutUsPage,
  DecorAndToysPage,
  ForChildrenPage,
  ForMenPage,
  ForWomenPage,
  MainPage,
  UserPage,
  NotFoundPage,
} from '../pages';
import { PrivateRoute } from './PrivateRoute';
import { useSettings } from 'hooks/useSettings';

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');

  if (false) setCurrentTheme('light');

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Routes>
        <Route path='/' element={<SharedLayout />}>
          <Route path='/' element={<MainPage />} />
          <Route path='/forMen' element={<ForMenPage />} />
          <Route path='/forWomen' element={<ForWomenPage />} />
          <Route path='/forChildren' element={<ForChildrenPage />} />
          <Route path='/decorAndToys' element={<DecorAndToysPage />} />
          <Route path='/aboutUs' element={<AboutUsPage />} />
          {/* <Route
                        path='/login'
                        element={
                            <RestrictedRoute
                                redirectTo='/user'
                                component={<LoginPage />}
                            />
                        }
                    />
                    <Route
                        path='/register'
                        element={
                            <RestrictedRoute
                                redirectTo='/user'
                                component={<RegisterPage />}
                            />
                        }
                    /> */}
                    <Route
                        path='/user'
                        element={
                            <PrivateRoute
                                redirectTo='/'
                                redirectBack='/user'
                                component={<UserPage />}
                            />
                        }
                    /> */}
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

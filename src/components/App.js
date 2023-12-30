import { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { refreshUser } from '../redux/auth/operations';
import { useAuth } from 'hooks';

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const dispatch = useDispatch();
  const { token } = useAuth();

  if (false) setCurrentTheme('light');

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch, token]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/forMen" element={<ForMenPage />} />
          <Route path="/forWomen" element={<ForWomenPage />} />
          <Route path="/forChildren" element={<ForChildrenPage />} />
          <Route path="/decorAndToys" element={<DecorAndToysPage />} />
          <Route path="/aboutUs" element={<AboutUsPage />} />
          <Route path="*" element={<NotFoundPage />} />
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
            path="/my-account"
            element={
              <PrivateRoute
                redirectTo="/"
                redirectBack="/my-account"
                component={<UserPage />}
              />
            }
          />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;

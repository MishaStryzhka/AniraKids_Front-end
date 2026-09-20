const fs = require('fs');
const path = require('path');

const authSensitiveFiles = [
  'src/components/Forms/AuthForm/AuthForm.js',
  'src/components/Modals/ModalRegister/ModalRegister.js',
  'src/pages/ConfirmEmailPage/ConfirmEmailPage.js',
  'src/components/Modals/ModalChangePassword/ModalChangePassword.js',
  'src/components/Modals/ModalResetPassword/ModalResetPassword.js',
  'src/redux/auth/operations.js',
];

const readSource = relativePath =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

test.each(authSensitiveFiles)('%s contains no active auth console logging', relativePath => {
  const source = readSource(relativePath);
  expect(source).not.toMatch(/console\.(log|debug|info|warn|error)\s*\(/);
});

test('AuthForm still dispatches only login and password to logIn on submit', () => {
  const source = readSource('src/components/Forms/AuthForm/AuthForm.js');
  expect(source).toMatch(/const \{ login, password \} = values;/);
  expect(source).toMatch(/dispatch\(logIn\(\{ login, password \}\)\);/);
});

test('GoogleLogin success still dispatches authByGoogle with credentialResponse', () => {
  const source = readSource('src/components/Modals/ModalRegister/ModalRegister.js');
  expect(source).toMatch(/onSuccess=\{credentialResponse => \{/);
  expect(source).toMatch(/dispatch\(authByGoogle\(credentialResponse\)\);/);
});

test('ConfirmEmailPage still dispatches confirmation token from search params', () => {
  const source = readSource('src/pages/ConfirmEmailPage/ConfirmEmailPage.js');
  expect(source).toMatch(/const token = searchParams\.get\('token'\);/);
  expect(source).toMatch(/dispatch\(confirmUserEmail\(\{ token: token \}\)\);/);
});

test('ModalChangePassword still dispatches new and confirmation passwords only', () => {
  const source = readSource('src/components/Modals/ModalChangePassword/ModalChangePassword.js');
  expect(source).toMatch(/dispatch\(updateUserInfo\(\{ newPassword, confirmNewPassword \}\)\);/);
});
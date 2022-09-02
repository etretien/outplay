export const generateActivationLetter = (link) => ({
  html: `
        <h1>Hello!</h1>
        <p>Please, copy and past the following code into outplay app to activate your account:</p>
        <p>${link}</p>
    `,
  text:
    'Hello! Please, copy and past the following code into outplay app to activate your account:\n' +
    link,
});

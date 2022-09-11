export const generateActivationLetter = (link: string) => ({
  html: `
        <h1>Hello!</h1>
        <p>Please, copy and paste the following code into outplay app to activate your account:</p>
        <p>${link}</p>
    `,
  text:
    'Hello! Please, copy and paste the following code into outplay app to activate your account:\n' +
    link,
});

export const generateRestoreLetter = (link: string) => ({
  html: `
        <h1>Hello!</h1>
        <p>Please, copy and paste the following code into outplay app in Forgot Password section to restore your password:</p>
        <p>${link}</p>
    `,
  text:
    'Hello! Please, copy and paste the following code into outplay app in Forgot Password section to restore your password:\n' +
    link,
});

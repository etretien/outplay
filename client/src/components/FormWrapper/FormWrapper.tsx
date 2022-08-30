import { FormEvent, PropsWithChildren } from 'react';

const FormWrapper = (props: PropsWithChildren & { onSubmit: () => void }) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit();
  };
  return <form onSubmit={handleSubmit}>{props.children}</form>;
};

export default FormWrapper;

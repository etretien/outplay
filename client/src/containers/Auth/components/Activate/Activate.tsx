import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import $api from '../../../../api';

import { setPopup } from '../../../../stores/popup';

const Activate = (props: { onActivate: (() => void) | undefined }) => {
  const location = useLocation();
  useEffect(() => {
    if (!location.search.length) {
      setPopup({
        title: 'Activation error',
        message: 'Activation link is missing',
        details: [],
        from: 'activation-error',
      });
    } else {
      const link = location.search.slice(1);
      $api
        .post('/auth/activate', { link })
        .then(() => {
          if (props.onActivate) props.onActivate();
        })
        .catch(() => {
          setPopup({
            title: 'API error',
            message: 'Activation link is not valid',
            details: [],
            from: 'activation-error',
          });
        });
    }
    console.log(location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Activate;

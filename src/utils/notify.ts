import { Notify } from 'quasar';
import { i18n } from 'src/boot/i18n';

interface ArboratorGrewError_t {
  error?: any;
  timeout?: number; // in milliseconds
  message?: string;
}

interface ArboratorMessage_t {
  message: string;
  timeout?: number;
}

export function notifyMessage(arboratorMessage: ArboratorMessage_t) {
  const message = arboratorMessage.message;
  const timeout = arboratorMessage.timeout || 10000;

  Notify.create({
    message,
    position: 'top-right',
    timeout,
    closeBtn: 'Dismiss',
    html: true,
  });
}

export function notifyError(ArboratorGrewError: ArboratorGrewError_t) {
  console.log('ArboratorGrewError : ', ArboratorGrewError);
  let msg;
  let caption = '';

  const error = ArboratorGrewError.error;
  let timeout = ArboratorGrewError.timeout;
  const message = ArboratorGrewError.message;
  console.error('Error message', message);
  if (message !== undefined) {
    msg = message;
  } else if (error !== undefined) {
    if (error.response) {
      console.log('Error error.response.status', error.response.status);
      console.log('Error error.response.message', error.response.message);
      console.log('Error error.response.data.message', error.response.data.message);
      if (error.response.status === 403) {
        msg = error.response.message ? error.response.message : i18n.global.t('error403');
      } else if (error.response.status === 401) {
        msg = error.response.message ? error.response.message : i18n.global.t('error401');
      } else if (error.response.status === 406) {
        // 406 is the errors for grew
        const grewErrorMessage = error.response.data.message || 'Unknown error, please contact the administrators';
        msg = `Grew internal error : ${grewErrorMessage}`;
        timeout = 20000;
      } else {
        msg = error.response.message ? error.response.message : `${error.response.statusText} error ${error.response.status}`;
      }
    }
  } else if (error.message !== undefined) {
    msg = error.message;
  } else {
    msg = `Oops, an unexpected error occured, please contact the administrators`;
  }
  if (error.caption) {
    caption = error.caption;
  }
  if (error.permanent) {
    Notify.create({
      message: msg,
      position: 'top-right',
      color: 'negative',
      icon: 'warning',
      caption,
      timeout: 0,
      closeBtn: 'Dismiss',
      html: true,
    });
  } else {
    timeout = timeout || 5000;
    Notify.create({
      message: msg,
      position: 'top-right',
      color: 'negative',
      icon: 'warning',
      caption,
      timeout,
    });
  }
}

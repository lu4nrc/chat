import { i18n } from "../translate/i18n";

const toastError = (err) => {
  const errorMsg = err.response?.data?.message || err.response.data.error;

  if (errorMsg) {
    if (i18n.exists(`backendErrors.${errorMsg}`)) {
      if (errorMsg === "ERR_OTHER_OPEN_TICKET") {
        const error =
          i18n.t(`backendErrors.${errorMsg}`) + ` ${err.response?.data.user}`;
        return error;
      } else {
        return i18n.t(`backendErrors.${errorMsg}`);
      }
    } else {
      return errorMsg;
    }
  } else {
    return "Ocorreu um erro!"
  }
};

export default toastError;

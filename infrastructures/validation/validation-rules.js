const isExisty = function (value) {
  return value !== null && value !== undefined;
};

const isEmpty = function (value) {
  if (value instanceof Array) {
    return value.length === 0;
  }
  return value === "" || !isExisty(value);
};

const isEmptyTrimed = function (value) {
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return true;
};

const validations = {
  matchRegexp: (value, regexp) => {
    const validationRegexp = regexp instanceof RegExp ? regexp : new RegExp(regexp);
    return isEmpty(value) || validationRegexp.test(value);
  },
  isNameSurname: (value) => {
    // const split = value?.split(" ");
    // const lastVal = split[split?.length - 1];
    // && !general.isNullOrEmpty(lastVal?.replace(/\s/g, ''))

    return isEmpty(value) || (value?.includes(" ") && value?.indexOf(" ") !== value?.length - 1);
  },

  isPhone: (value) => {
    const validationRegexp = /^\d{10}$/;
    return isEmpty(value) || validationRegexp.test(value);
  },
  isIdentityNo: (value) => {
    const validationRegexp = /^\d{11}$/;
    return isEmpty(value) || validationRegexp.test(value);
  },
  isEmail: (value) => {
    const validationRegexp =
      /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    return isEmpty(value) || validationRegexp.test(value);
  },

  isEmpty: (value) => isEmpty(value),
  isBool: (value) => isEmpty(value) || value === true || value === false,
  minArrayLength: (value, min) => isEmpty(value) || !(value instanceof Array) || value?.length >= min,
  minArrayLengthRequired: (value, min) => (!isEmpty(value) && !(value instanceof Array)) || value?.length >= min,
  isTrue: (value) => isEmpty(value) || value === true,
  required: (value) => {
    if (typeof value === "string" || value instanceof String) {
      return !isEmpty(value) && value != "[]" && value.replace(/\s/g, "").length !== 0;
    } else return !isEmpty(value);
  },

  trim: (value) => !isEmptyTrimed(value),

  isNumber: (value) => {
    const validationRegexp = /^\d+$/;
    return isEmpty(value) || validationRegexp.test(value);
  },
  isPrice: (value) => {
    const validationRegexp = /^(\d*([.](?=\d{1}))?\d{0,2})?$/;
    return isEmpty(value) || validationRegexp.test(value);
  },

  isFloat: (value) => {
    const validationRegexp = /^(?:-?[1-9]\d*|-?0)?(?:\.\d+)?$/i;
    return isEmpty(value) || validationRegexp.test(value);
  },

  isPositive: (value) => {
    if (isExisty(value)) {
      const isNumber = (val) => {
        const validationRegexp = /^\d+$/;
        return isEmpty(val) || validationRegexp.test(val);
      };
      const isFloat = (val) => {
        const validationRegexp = /^(?:-?[1-9]\d*|-?0)?(?:\.\d+)?$/i;
        return isEmpty(val) || validationRegexp.test(val);
      };
      return (isNumber(value) || isFloat(value)) && value >= 0;
    }
    return true;
  },

  maxNumber: (value, max) => isEmpty(value) || parseInt(value, 10) <= parseInt(max, 10),

  isEqual: (value, otherValue) => isEmpty(value) || value == otherValue,

  minNumber: (value, min) => isEmpty(value) || parseInt(value, 10) >= parseInt(min, 10),

  maxFloat: (value, max) => isEmpty(value) || parseFloat(value) <= parseFloat(max),

  minFloat: (value, min) => isEmpty(value) || parseFloat(value) >= parseFloat(min),

  isString: (value) => !isEmpty(value) || typeof value === "string" || value instanceof String,

  minStringLength: (value, length) => (value + "").length >= length,

  maxStringLength: (value, length) => (value + "").length <= length,

  passwordContainesLetterAndNumber: (value) => {
    if (typeof value !== "string") return false; // sadece string değerler için geçerli
    const letterRegex = /[a-zA-Z]/;
    const numberRegex = /[0-9]/;
    return letterRegex.test(value) && numberRegex.test(value);
  },
  matches: (value, compareValue) => value === compareValue,

  isAdult: (value) => {
    if (!value) return true; // Boş değer için geçerli kabul et
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  },
};

const messages = {
  matchRegexp: () => "Geçersiz format",
  isPhone: () => "Geçersiz telefon",
  isIdentityNo: () => "Geçersiz TC kimlik",
  isEmail: () => "Geçersiz e-posta",
  isEmpty: (value) => isEmpty(value),
  isNameSurname: () => "Geçersiz ad ve soyad",
  required: () => "Zorunlu",
  trim: (value) => !isEmptyTrimed(value),
  isNumber: () => "Geçersiz sayı",
  isPrice: () => "Geçersiz fiyat",
  isFloat: () => "Geçerli bir sayı girin",
  isPositive: () => "Geçersiz pozitif sayı",
  maxNumber: (value, max) => `En fazla ${max} olabilir`,
  minNumber: (value, min) => `En az ${min} olmalıdır`,
  minArrayLength: (value, min) => `En az ${min} adet seçin`,
  minArrayLengthRequired: (value, min) => `En az ${min} adet seçin`,
  maxFloat: (value, max) => `En fazla ${max} olabilir`,
  minFloat: (value, min) => `En az ${min} olmalıdır`,
  isString: () => "Geçersiz metin",
  minStringLength: (value, length) => `En az ${length} karakter olmalıdır`,
  maxStringLength: (value, length) => `En fazla ${length} karakter olabilir`,
  isEqual: () => "Değerler eşleşmiyor",
  passwordContainesLetterAndNumber: () => "Şifre en az bir harf ve bir rakam içermelidir",
  matches: () => "Değerler eşleşmiyor",
  isAdult: () => "Müşteri 18 yaşından büyük olmalıdır",
};

module.exports = {
  ValidationRules: validations,
  ValidationMessages: messages,
};

import general from "@/utils/general";
import { ValidationMessages, ValidationRules } from "./validation-rules.js";
class Validator {
  constructor() {
    this.constraints = {};
    this.isValid = false;
    this.scopeKey = general.generateRandomString(5);
    this.items = {};
    this.coordinates = {};
    this.handleValidation = false;
  }

  generateNewScopeKey() {
    this.scopeKey = general.generateRandomString(5);
    return this.scopeKey;
  }

  isNullOrEmpty(value) {
    return value === "" || value === null || value === undefined || (value instanceof Array && value?.length === 0);
  }

  static addValidationRule(name, validateCallback, messageCallback) {
    ValidationMessages[name] = messageCallback;
    ValidationRules[name] = validateCallback;
  }

  static removeValidationRule(name) {
    delete ValidationMessages[name];
    delete ValidationRules[name];
  }

  allValid() {
    let data = this.allValidWithFirstInvalidItem();
    return data.isValid;
  }

  allValidWithFirstInvalidItem() {
    this.handleValidation = true;
    let isValid = true;
    let firstInvalidItem = {};
    Object.keys(this.items).map((key) => {
      const item = this.items[key];
      if (item.scopeKey !== this.scopeKey) return; // burada map durmuyor, sadece itemin işlemi kesiliyor
      let errMsg = this.validateAndGetErrorMessage(key, this.items[key].lastValue, true);
      if (!this.isNullOrEmpty(errMsg) && (isValid || this.isNullOrEmpty(firstInvalidItem?.coordinate?.y))) {
        isValid = false;
        const item = this.items[key];
        firstInvalidItem = { ...item };
        firstInvalidItem.name = key;
        if (!this.isNullOrEmpty(item?.coordinateProviderName) && this.coordinates[item?.coordinateProviderName]) {
          firstInvalidItem.coordinate = { ...this.coordinates[item?.coordinateProviderName] };
        }
      }
    });
    return { isValid, firstInvalidItem };
  }

  registerDestructuring({ name, value, rules, validatorScopeKey, setChangedAnyway = false, coordinateProviderName }) {
    return this.register(name, value, rules, validatorScopeKey, setChangedAnyway, coordinateProviderName);
  }

  register(name, value, rules, scopeKey, setChangedAnyway = false, coordinateProviderName) {
    if (!this.items[name]) {
      this.items[name] = {
        lastValue: null,
        rules: rules,
        errorMessage: null,
        scopeKey,
        isChangedBefore: false,
        coordinateProviderName,
      };
    }
    const item = this.items[name];

    item.scopeKey = scopeKey;
    item.rules = rules;

    let errMsg = this.validateAndGetErrorMessage(name, value, setChangedAnyway);

    this.items[name].lastValue = value;
    if (this.handleValidation) return errMsg;
  }

  registerLayoutForCoordinateProvider(name, layoutEvent) {
    const layout = layoutEvent.nativeEvent.layout;
    this.coordinates[name] = { ...layout };
  }

  validateAndGetErrorMessage(name, value, setChangedAnyway = false) {
    const item = this.items[name];
    if (setChangedAnyway) item.isChangedBefore = true;

    item.lastValue = value;
    if (!this.isNullOrEmpty(value)) item.isChangedBefore = true;
    if (!item.isChangedBefore && this.isNullOrEmpty(value)) {
      item.errorMessage = null;
      return null;
    }

    let errMsg = "";
    for (let i = 0; i < item.rules.length; i++) {
      const ruleItem = item.rules[i];
      const isValid = ValidationRules[ruleItem.rule](value, ruleItem?.value);
      if (!isValid) {
        const msg = ruleItem?.message ?? ValidationMessages[ruleItem.rule](value, ruleItem?.value);
        errMsg = msg;
        break;
      }
    }
    item.errorMessage = errMsg;
    return errMsg;
  }
}

export default Validator;

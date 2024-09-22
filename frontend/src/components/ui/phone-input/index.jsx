import { useState } from "react";

import {
  getExampleNumber,
  isValidPhoneNumber as matchIsValidPhoneNumber,
  parsePhoneNumber,
} from "libphonenumber-js";
import i18nIsoCountries from "i18n-iso-countries";
import enCountries from "i18n-iso-countries/langs/en.json";
import PhoneInput from "react-phone-number-input/input";
import examples from "libphonenumber-js/mobile/examples";
import { Input } from "../input";

import { ComboboxCountryInput } from "./combobox";
import {
  getCountriesOptions,
  isoToEmoji,
  replaceNumbersWithZeros,
} from "./helpers";

i18nIsoCountries.registerLocale(enCountries);

export const PhoneInputUi = ({ value, onChange }) => {
  const options = getCountriesOptions();

  // You can use a the country of the phone number to set the default country
  const defaultCountry = parsePhoneNumber("+556300000000")?.country;
  const defaultCountryOption = options.find(
    (option) => option.value === defaultCountry
  );

  const [country, setCountry] = useState(defaultCountryOption || options[0]);

  const placeholder = replaceNumbersWithZeros(
    getExampleNumber(country.value, examples).formatInternational()
  );

  const onCountryChange = (value) => {
    onChange(undefined);
    setCountry(value);
  };

  const isValidPhoneNumber = matchIsValidPhoneNumber(value ?? "");

  const handlePhoneNumberChange = (phoneNumber) => {
    // Remove o "+" caso exista no início do número
    const sanitizedPhoneNumber = phoneNumber?.startsWith("+")
      ? phoneNumber.slice(1)
      : phoneNumber;
    
    onChange(sanitizedPhoneNumber);
  };

  return (
    <div className="not-prose flex flex-col gap-4">
      <div className="flex gap-2">
        <ComboboxCountryInput
          value={country}
          onValueChange={onCountryChange}
          options={options}
          placeholder="Procurar..."
          renderOption={({ option }) =>
            `${isoToEmoji(option.value)} ${option.label}`
          }
          renderValue={(option) => option.label}
          emptyMessage="Não encontrado."
        />
        <PhoneInput
          international
          withCountryCallingCode
          country={country.value.toUpperCase()}
          value={value}
          inputComponent={Input}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
      {/*     <span className="text-sm">country: {country.label}</span>
      <span className="text-sm">indicatif: {country.indicatif}</span>
      <span className="text-sm">placeholder: {placeholder}</span>
      <span className="text-sm">value: {phoneNumber}</span>
      <span
        className={cn(
          "text-sm",
          isValidPhoneNumber ? "text-green-500" : "text-red-500"
        )}
      >
        isValid: {isValidPhoneNumber ? "true" : "false"}
      </span> */}
    </div>
  );
};

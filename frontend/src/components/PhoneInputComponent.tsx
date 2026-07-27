import React from 'react';
import { PhoneInput, ParsedCountry } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber';
import 'react-international-phone/style.css';

const phoneUtil = PhoneNumberUtil.getInstance();

interface PhoneInputComponentProps {
  value: string;
  onChange: (phone: string) => void;
  required?: boolean;
}

export const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({ value, onChange, required = false }) => {
  const handlePhoneChange = (newPhone: string, meta: { country: ParsedCountry; inputValue: string }) => {
    // Always allow deleting characters (backspacing)
    if (newPhone.length < value.length) {
      onChange(newPhone);
      return;
    }

    try {
      // Check if the new phone number is too long for the selected country
      const parsed = phoneUtil.parseAndKeepRawInput(newPhone, meta.country.iso2.toUpperCase());
      const reason = phoneUtil.isPossibleNumberWithReason(parsed);
      
      // 3 means TOO_LONG in PhoneNumberUtil.ValidationResult
      if (reason === 3) {
        // Discard the change because it exceeds the country's max length
        return;
      }
    } catch (e) {
      // If the number cannot be parsed yet (e.g. only dialing code entered), allow it
    }

    // Otherwise, accept the change
    onChange(newPhone);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="block text-xs font-bold text-slate-700">Phone Number</label>
      <PhoneInput
        defaultCountry="bd"
        value={value}
        onChange={handlePhoneChange}
        required={required}
        inputClassName="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-bold"
        countrySelectorStyleProps={{
          buttonClassName: "bg-slate-100 border border-slate-200 rounded-l-xl px-3 py-3 h-full"
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
};

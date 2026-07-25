import React, { useState, useRef, useEffect } from 'react';
import { usePhoneInput, defaultCountries, parseCountry, CountryData } from 'react-international-phone';
import { ChevronDown, ChevronUp } from 'lucide-react';
import 'react-international-phone/style.css';

interface PhoneInputComponentProps {
  value: string;
  onChange: (phone: string) => void;
}

export const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({ value, onChange }) => {
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: 'bd',
      value,
      countries: defaultCountries,
      onChange: (data) => {
        onChange(data.phone);
      },
    });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // country is already a ParsedCountry object, no need to parse it
  const selectedCountry = country;

  return (
    <div className="flex flex-col gap-4">
      {/* Country Selector (Styled like the reference image) */}
      <div className="relative" ref={dropdownRef}>
        {/* Floating Label Container */}
        <div 
          className={`relative border rounded-2xl flex items-center justify-between px-4 py-3 cursor-pointer ${
            isOpen ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'
          } bg-white text-slate-900 transition-all shadow-sm`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Floating Label */}
          <span className="absolute -top-2.5 left-4 bg-white px-1 text-xs text-indigo-600 font-bold tracking-wide">
            Country
          </span>

          {/* Selected Country Display */}
          <span className="font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-sm tracking-wide border border-indigo-100">
            {selectedCountry.name}
          </span>
          
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {defaultCountries.map((c: CountryData) => {
              const countryInfo = parseCountry(c);
              const isSelected = countryInfo.iso2 === country.iso2;
              return (
                <div
                  key={countryInfo.iso2}
                  className={`flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => {
                    setCountry(countryInfo.iso2);
                    setIsOpen(false);
                  }}
                >
                  {/* Flag image */}
                  <span className="mr-4 leading-none flex items-center justify-center w-8 h-6 overflow-hidden rounded-sm bg-slate-100 border border-slate-200">
                     <img src={`https://flagcdn.com/w40/${countryInfo.iso2}.png`} className="w-full h-full object-cover" alt={countryInfo.name} />
                  </span>
                  <span className="flex-1 text-[15px] text-slate-900 font-bold tracking-wide">{countryInfo.name}</span>
                  <span className="text-[15px] font-bold text-slate-500">+{countryInfo.dialCode}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all shadow-sm">
          <div className="flex items-center px-4 bg-slate-100 border-r border-slate-200 text-slate-700 font-black text-sm">
            +{selectedCountry.dialCode}
          </div>
          <input
            type="tel"
            value={inputValue}
            onChange={handlePhoneValueChange}
            ref={inputRef}
            placeholder="e.g. 1712345678"
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-bold"
          />
        </div>
      </div>
    </div>
  );
};

'use client';
import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  label: string | React.ReactNode;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'minimal' | 'bordered';
  placeholder?: string;
  className?: string;
  menuClassName?: string;
}

export default function Dropdown({ 
  options, 
  value, 
  onChange, 
  variant = 'bordered',
  placeholder = 'Select an option',
  className = '',
  menuClassName = ''
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Styles based on variant
  const baseButtonStyles = "flex items-center justify-between gap-2 w-full transition-all duration-200 cursor-pointer outline-none";
  const variantStyles = {
    minimal: "text-gray-600 hover:text-primary bg-transparent text-xs",
    bordered: "border-2 border-gray-200 text-gray-700 font-bold rounded-sm px-4 py-2 hover:border-gray-300 focus:border-primary bg-white text-sm"
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseButtonStyles} ${variantStyles[variant]}`}
      >
        <span className="truncate flex-1 text-left flex items-center">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute z-50 mt-1 min-w-full w-max bg-white shadow-xl border border-gray-100 rounded-sm overflow-hidden transition-all duration-200 transform origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'} ${menuClassName}`}
      >
        <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  value === option.value 
                    ? 'bg-primary/5 text-primary font-bold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <span className="truncate flex-1 text-left flex items-center">
                  {option.label}
                </span>
                {value === option.value && (
                  <svg className="w-4 h-4 text-primary ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
}

interface AdminDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminDropdown({ options, value, onChange, placeholder = "Select an option", className = "" }: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white rounded-lg px-4 py-2.5 text-sm hover:border-[#6A43FB]/50 focus:outline-none focus:ring-2 focus:ring-[#6A43FB]/20 transition-all shadow-md shadow-[#6A43FB]/5 ${
          isOpen ? "border border-[#6A43FB]/50 ring-2 ring-[#6A43FB]/20" : "border border-gray-200"
        }`}
      >
        <span className={selectedOption ? "font-bold text-gray-800" : "font-medium text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#6A43FB]" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-[#6A43FB]/20 rounded-xl shadow-2xl shadow-[#6A43FB]/20 overflow-hidden transition-all duration-200 origin-top ${
          isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-h-56 overflow-y-auto dropdown-scrollbar py-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === option.value 
                  ? "bg-[#6A43FB]/10 text-[#6A43FB] font-bold" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              {option.label}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No options available</div>
          )}
        </div>
      </div>
    </div>
  );
}

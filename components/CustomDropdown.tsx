import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold mb-1 text-slate-500 uppercase tracking-wider">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl flex items-center justify-between transition-all duration-200 ${isOpen
                        ? "border-emerald-500 ring-2 ring-emerald-100 bg-white"
                        : "border-slate-100 hover:border-slate-200 hover:bg-white"
                    }`}
            >
                <span
                    className={`text-sm font-bold ${selectedOption ? "text-slate-800" : "text-slate-400"
                        }`}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 space-y-0.5">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-sm font-bold transition-colors ${value === option.value
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <Check size={16} className="text-emerald-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;

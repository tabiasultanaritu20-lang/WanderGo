import React from "react";


/**
 * Reusable input component with Tailwind styles
 * Props: label, name, type, value, onChange, placeholder, autoComplete, required, disabled
 */
const Input = ({
                   label,
                   name,
                   type = "text",
                   value,
                   onChange,
                   placeholder,
                   autoComplete,
                   required,
                   disabled,
                   className = "",
                   inputClassName = "",
               }) => {
    return (
        <div className={"mb-3 " + className}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                disabled={disabled}
                className={
                    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none " +
                    "focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 " +
                    inputClassName
                }
            />
        </div>
    );
};


export default Input;


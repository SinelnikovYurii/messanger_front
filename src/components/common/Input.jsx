import React from 'react';
import './css/Input.css';

const Input = ({
                   label,
                   type = 'text',
                   value,
                   onChange,
                   placeholder,
                   error,
                   required = false,
                   ...props
               }) => {
    return (
        <div className="input-group">
            {label && (
                <label className="input-label">
                    {label} {required && <span>*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`input ${error ? 'input-error' : ''}`}
                required={required}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;
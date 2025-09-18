import React from 'react';
import './css/Button.css';

const Button = ({
                    children,
                    onClick,
                    variant = 'primary',
                    disabled = false,
                    type = 'button',
                    className = ''
                }) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
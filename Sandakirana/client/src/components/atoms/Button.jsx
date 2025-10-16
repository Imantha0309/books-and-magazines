import React from 'react';

const variantClasses = {
  primary: 'button primary',
  outline: 'button outline',
  ghost: 'button',
  link: 'link-button',
  interaction: 'interaction-button',
};

export const Button = ({ variant = 'primary', tone, className = '', children, ...props }) => {
  const baseClass = variantClasses[variant] || 'button';
  const toneClass = tone === 'danger' ? 'danger' : '';
  const classes = [baseClass, toneClass, className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

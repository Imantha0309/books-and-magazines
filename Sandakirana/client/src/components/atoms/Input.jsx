import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', ...props }, ref) => (
  <input ref={ref} className={['form-input', className].filter(Boolean).join(' ')} {...props} />
));

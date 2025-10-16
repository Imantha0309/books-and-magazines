import React, { forwardRef } from 'react';

export const TextArea = forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={['form-input', 'text-area', className].filter(Boolean).join(' ')}
    {...props}
  />
));

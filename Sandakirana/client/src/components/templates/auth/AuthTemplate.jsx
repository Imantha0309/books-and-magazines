import React from 'react';

export const AuthTemplate = ({ title, subtitle, children, footer }) => (
  <section className="page centered">
    <div className="panel">
      {title ? <h1 className="title">{title}</h1> : null}
      {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      {children}
      {footer ? <div className="form-footer">{footer}</div> : null}
    </div>
  </section>
);

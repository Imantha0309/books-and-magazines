import React from 'react';
import { Input } from '../../atoms/Input';

export const HomeSearch = ({ value, onChange, placeholder = 'Search posts and authors' }) => (
  <div className="home-search-bar">
    <span className="home-search-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l4.25 4.25a1 1 0 0 0 1.42-1.42L15.5 14Zm-5.5 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
          fill="currentColor"
        />
      </svg>
    </span>
    <div className="home-search-field">
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="home-search-input"
      />
      {value ? (
        <button className="home-search-clear" type="button" onClick={() => onChange('')}>
          Clear
        </button>
      ) : null}
    </div>
  </div>
);

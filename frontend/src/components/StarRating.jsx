import { useState } from 'react';

// Interactive star rating
export function StarPicker({ value, onChange, max = 5 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value || 0;

  return (
    <div className="stars" role="group" aria-label="Rate from 1 to 5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${display >= star ? 'active' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// Read-only display
export function StarDisplay({ value, max = 5 }) {
  const rounded = Math.round(value);
  return (
    <div className="stars stars-readonly" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span key={star} className={`star ${rounded >= star ? 'active' : ''}`}>★</span>
      ))}
    </div>
  );
}

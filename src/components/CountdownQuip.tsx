import React from 'react';

interface CountdownQuipProps {
  quip: string;
}

export const CountdownQuip: React.FC<CountdownQuipProps> = ({ quip }) => {
  if (!quip) return null;

  return (
    <div className="commentary-quip commentary-quip--animated">
      {/* Speech bubble tail pointing up */}
      <div className="commentary-quip__tail"></div>

      {/* Speech bubble content */}
      <div className="commentary-quip__bubble">
        <div className="commentary-quip__content">
          {/* Commentator icon */}
          <div className="commentary-quip__icon">
            📢
          </div>

          {/* Quote text */}
          <div className="commentary-quip__text-wrapper">
            <p className="commentary-quip__text">
              {quip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

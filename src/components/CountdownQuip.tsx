import React from 'react';

interface CountdownQuipProps {
  quip: string;
}

export const CountdownQuip: React.FC<CountdownQuipProps> = ({ quip }) => {
  if (!quip) return null;

  return (
    <div className="relative mt-4">
      {/* Speech bubble tail pointing up */}
      <div className="absolute -top-3 left-8 w-6 h-6 bg-gradient-to-br from-orange-100 to-orange-50 transform rotate-45 border-t-2 border-l-2 border-orange-200"></div>

      {/* Speech bubble content */}
      <div className="relative bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl shadow-lg p-4 sm:p-5 border-2 border-orange-200">
        <div className="flex items-start gap-3">
          {/* Commentator icon */}
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl shadow-md">
            📢
          </div>

          {/* Quote text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed italic font-medium">
              "{quip}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

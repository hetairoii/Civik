import React from 'react';

export const Card = ({ title, description, img, color }) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-xl overflow-hidden shadow-lg 
      hover:shadow-2xl hover:scale-105 transition-all duration-300 
      flex flex-col h-full border border-[var(--color-brand-beige)] dark:border-gray-700
    `}>
      <div className={`h-2 w-full bg-[var(--color-brand-green)]`}></div>
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        {img && (
           <div className="mb-4 bg-[var(--color-brand-beige)] p-3 rounded-full">
             <img src={img} alt={title} className="w-12 h-12 object-contain" />
           </div>
        )}
        <h2 className="text-xl font-bold mb-3 text-[var(--color-brand-green)] dark:text-[var(--color-brand-blue)]">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

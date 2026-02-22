export const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyles = "px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[var(--color-brand-green)] text-white hover:bg-opacity-90 focus:ring-[var(--color-brand-green)]",
    secondary: "bg-[var(--color-brand-blue)] text-white hover:bg-opacity-90 focus:ring-[var(--color-brand-blue)]",
    outline: "border-2 border-[var(--color-brand-green)] text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white dark:border-[var(--color-brand-beige)] dark:text-[var(--color-brand-beige)] dark:hover:bg-[var(--color-brand-beige)] dark:hover:text-[var(--color-brand-green)]",
    dark: "bg-[var(--color-brand-beige)] text-[var(--color-brand-green)] hover:bg-opacity-90 focus:ring-[var(--color-brand-beige)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

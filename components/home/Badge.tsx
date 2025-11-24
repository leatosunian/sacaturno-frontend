export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement> & { variant?: "primary" | "secondary" }> = ({ children, className = "", variant = "primary", ...rest }) => {
    const base =
        "inline-flex items-center rounded-full text-sm font-medium px-3 py-1.5 ";
    const variants = {
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-200",
    };
    return (
        <span className={`${base} ${variants[variant]} ${className}`} {...rest}>
            {children}
        </span>
    );
};
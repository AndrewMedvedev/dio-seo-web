const variantClasses = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

export default function StatusAlert({ children, variant = "error", className = "" }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-base ${
        variantClasses[variant] || variantClasses.error
      } ${className}`}
    >
      {children}
    </div>
  );
}

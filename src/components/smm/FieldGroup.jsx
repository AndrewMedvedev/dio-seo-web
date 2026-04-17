export default function FieldGroup({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-base text-neutral-400 mb-2">{label}</label>
      {children}
    </div>
  );
}

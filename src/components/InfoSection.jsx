const InfoSection = ({ title, children, containerClassName = "" }) => {
    return (
        <div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div
            className={`bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed ${containerClassName}`}
        >
            {children}
        </div>
        </div>
    );
};

export default InfoSection;
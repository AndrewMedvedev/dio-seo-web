const Input = ({ name, inputType, classNameLabel, classNameInput }) => {
  return (
    <div>
      <label className={classNameLabel}>{name}</label>
      <input type={inputType} className={classNameInput}></input>
    </div>
  );
};

export default Input;

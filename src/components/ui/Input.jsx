import { useId, useState } from "react";

export default function Input({
  label,
  floating = false,
  className = "",
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const [focused, setFocused] = useState(false);
  const hasValue = props.value != null && String(props.value).length > 0;

  if (floating && label) {
    return (
      <label
        className={`ui-input-wrap ui-input-wrap--float ${focused || hasValue ? "ui-input-wrap--active" : ""} ${className}`}
        htmlFor={id}
      >
        <input
          id={id}
          className="ui-input"
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        <span className="ui-input__float-label">{label}</span>
      </label>
    );
  }

  return (
    <label className={`ui-field ${className}`} htmlFor={id}>
      {label && <span className="ui-field__label">{label}</span>}
      <input id={id} className="ui-input" {...props} />
    </label>
  );
}

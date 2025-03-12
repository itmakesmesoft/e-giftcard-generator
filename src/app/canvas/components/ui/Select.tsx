import { ChangeEvent } from "react";

const Select = (props: {
  options: { value: string | number; label: string }[];
  id?: string;
  name?: string;
  value?: string | number;
  label?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const { label, options, value, onChange, ...restProps } = props;
  return (
    <label>
      {label}
      <select value={value} onChange={onChange} {...restProps}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;

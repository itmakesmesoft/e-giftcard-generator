import { CheckIcon } from "@radix-ui/react-icons";
import { Select as RadixSelect } from "radix-ui";

interface SelectProps extends RadixSelect.SelectProps {
  options: { value: string; label: string }[];
  className?: string;
}

const Select = (props: SelectProps) => {
  const { options, className, onValueChange, value, ...restProps } = props;
  return (
    <RadixSelect.Root
      onValueChange={onValueChange}
      value={value}
      {...restProps}
    >
      <RadixSelect.Trigger
        className={`hover:bg-gray-100 cursor-pointer ${className}`}
      >
        <RadixSelect.Value placeholder="타입을 선택해주세요." />
        <RadixSelect.Icon />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-white rounded-sm border border-gray-300 z-100">
          <RadixSelect.ScrollUpButton />
          <RadixSelect.Viewport>
            {options.map((option, index) => (
              <RadixSelect.Item
                key={index}
                value={option.value}
                className="hover:bg-gray-100 cursor-pointer py-0.5 px-2 "
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="inline-block">
                  <CheckIcon />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton />
          <RadixSelect.Arrow />
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;

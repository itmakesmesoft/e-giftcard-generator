import {
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
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
        className={`inline-flex items-center justify-between w-full px-3 py-2 ${className}`}
      >
        <RadixSelect.Value placeholder="타입을 선택해주세요." />
        <RadixSelect.Icon />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="bg-white rounded-sm border border-gray-300 z-100 w-[var(--radix-select-trigger-width)]"
          position="popper"
          sideOffset={5}
        >
          <ScrollButton direction="up" />
          <RadixSelect.Viewport className="max-h-[200px] overflow-auto">
            {options.map((option, index) => (
              <RadixSelect.Item
                key={index}
                value={option.value}
                className="relative flex items-center px-6 py-2 hover:bg-gray-100 cursor-pointer outline-none"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute left-1">
                  <CheckIcon />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <ScrollButton direction="down" />
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;

interface ScrollButtonProps {
  direction: "up" | "down";
}

const ScrollButton = ({ direction }: ScrollButtonProps) => {
  const Icon = direction === "up" ? ChevronUpIcon : ChevronDownIcon;
  const Button =
    direction === "up"
      ? RadixSelect.ScrollUpButton
      : RadixSelect.ScrollDownButton;

  return (
    <div className="h-6">
      <Button className="flex items-center justify-center h-full w-full bg-white text-gray-700 cursor-default hover:bg-gray-50">
        <Icon />
      </Button>
    </div>
  );
};

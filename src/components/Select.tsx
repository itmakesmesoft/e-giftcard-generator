import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";
import { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";

interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends RadixSelect.SelectProps {
  options: Option[];
  label?: string;
  className?: string;
  placeholder?: string;
}

const Select = (props: SelectProps) => {
  const {
    options,
    className,
    onValueChange,
    placeholder,
    value,
    ...restProps
  } = props;
  const mappedOptions = useMemo(() => {
    return new Map(options.map((v) => [v.value, v.label]));
  }, [options]);

  const [internalValue, setInternalValue] = useState(value || "");
  const [scrollParent, setScrollParent] = useState<HTMLDivElement>();

  const handleOnValueChange = (value: string) => {
    setInternalValue(value);
    onValueChange?.(value);
  };

  return (
    <RadixSelect.Root
      value={internalValue}
      onValueChange={handleOnValueChange}
      {...restProps}
    >
      <RadixSelect.Trigger
        className={`inline-flex items-center justify-between px-3 py-2 ${className}`}
      >
        <RadixSelect.Value placeholder={placeholder}>
          {mappedOptions.get(internalValue)}
        </RadixSelect.Value>
        <ChevronDown width="16" />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-white rounded-sm border border-gray-300 z-100">
          <RadixSelect.ScrollUpButton className="h-6 flex flex-col justify-center items-center">
            <ChevronUp color="darkgray" />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport
            ref={(node) => {
              if (node) setScrollParent(node);
            }}
          >
            <Virtuoso
              data={options}
              itemContent={(_, option: Option) => (
                <RadixSelect.Item
                  value={option.value}
                  className="rounded-sm relative flex items-center px-6 py-1 hover:bg-gray-100 cursor-pointer outline-none"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute left-1">
                    <Check width="12" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              )}
              increaseViewportBy={500}
              customScrollParent={scrollParent}
            />
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="h-6 flex flex-col justify-center items-center">
            <ChevronDown color="darkgray" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;

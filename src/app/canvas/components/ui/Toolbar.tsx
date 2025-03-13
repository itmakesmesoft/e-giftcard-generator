import { ChangeEvent, ReactNode } from "react";
import Input, { type InputProps } from "./Input";
import ColorPicker, { type ColorPickerProps } from "./ColorPicker";
import { DropdownMenu, Toolbar as RadixToolbar, Select } from "radix-ui";
import {
  ToolbarToggleGroupMultipleProps,
  ToolbarToggleGroupSingleProps,
} from "@radix-ui/react-toolbar";

const Toolbar = ({ children }: { children: ReactNode }) => {
  return (
    <RadixToolbar.Root className="flex flex-row gap-4 bg-white px-4 py-2 rounded-xl border">
      {children}
    </RadixToolbar.Root>
  );
};

interface ToggleGroupItem {
  icon: ReactNode;
  value: string;
  label: string;
}
type ToolbarToggleGroupProps = {
  className?: string;
  items: ToggleGroupItem[];
} & (ToolbarToggleGroupMultipleProps | ToolbarToggleGroupSingleProps);
const ToolbarToggleGroup = ({
  className,
  items,
  ...restProps
}: ToolbarToggleGroupProps) => {
  return (
    <RadixToolbar.ToggleGroup
      className={`${className} flex flex-row items-center`}
      {...restProps}
    >
      {items.map((item, index) => (
        <RadixToolbar.ToggleItem
          key={index}
          value={item.value}
          aria-label={item.label}
          className={`data-[state="on"]:bg-purple-500`}
        >
          {item.icon}
        </RadixToolbar.ToggleItem>
      ))}
    </RadixToolbar.ToggleGroup>
  );
};

type ToolbarSelectProps = Select.SelectProps & {
  title: ReactNode;
  children: ReactNode;
};
const ToolbarSelect = ({
  title,
  children,
  ...restProps
}: ToolbarSelectProps) => {
  return (
    <Select.Root {...restProps}>
      <RadixToolbar.Button asChild>
        <Select.Trigger
          className="flex flex-row justify-between items-center gap-4 px-4 cursor-pointer"
          aria-label="font"
        >
          {title}
        </Select.Trigger>
      </RadixToolbar.Button>
      <Select.Portal>
        <Select.Content
          className="bg-white p-2 rounded-lg"
          position="popper"
          sideOffset={10}
        >
          <Select.Viewport className="SelectViewport">
            {children}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
interface SelectItemsProps {
  value: string;
  icon?: ReactNode;
  label: string;
}
const ToolbarSelectItem = ({ value, icon, label }: SelectItemsProps) => {
  return (
    <Select.Item
      value={value}
      aria-label={label}
      className="hover:bg-gray-200 px-2 py-0.5 cursor-pointer flex flex-row items-center"
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Select.Item>
  );
};

type ToolbarDropdownProps = DropdownMenu.DropdownMenuProps & {
  title: ReactNode;
  children: ReactNode;
};
const ToolbarDropdown = ({ title, children }: ToolbarDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <RadixToolbar.Button asChild>
        <DropdownMenu.Trigger className="">{title}</DropdownMenu.Trigger>
      </RadixToolbar.Button>
      <DropdownMenu.Content className="mt-4 py-2 px-4 rounded-xl bg-white">
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

type ToolbarColorPickerProps = ColorPickerProps;
const ToolbarColorPicker = ({
  color,
  onChange,
  className,
}: ToolbarColorPickerProps) => {
  return (
    <ColorPicker color={color} onChange={onChange} className={className} />
  );
};

type ToolbarInputProps = Omit<InputProps, "onValueChange"> & {
  onValueChange?: (value: string | number) => void;
};
const ToolbarInput = ({
  onValueChange,
  className,
  ...restProps
}: ToolbarInputProps) => {
  return (
    <Input
      className={`${className} w-[60px]`}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onValueChange?.(e.target.value);
      }}
      {...restProps}
    />
  );
};

const ToolbarSeparator = () => (
  <RadixToolbar.Separator className="ToolbarSeparator" />
);

export default Object.assign(Toolbar, {
  ToggleGroup: ToolbarToggleGroup,
  Select: ToolbarSelect,
  SelectItem: ToolbarSelectItem,
  Dropdown: ToolbarDropdown,
  ColorPicker: ToolbarColorPicker,
  Input: ToolbarInput,
  Separator: ToolbarSeparator,
});

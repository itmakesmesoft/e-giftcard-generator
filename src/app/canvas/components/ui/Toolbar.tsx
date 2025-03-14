import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import Input, { type InputProps } from "./Input";
import { DropdownMenu, Toolbar as RadixToolbar, Select } from "radix-ui";
import {
  ToolbarToggleGroupMultipleProps,
  ToolbarToggleGroupSingleProps,
} from "@radix-ui/react-toolbar";
import { Color, ColorResult, SketchPicker } from "react-color";

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
      className={`flex flex-row items-center ${className}`}
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
  className?: string;
};
const ToolbarSelect = ({
  title,
  children,
  className,
  ...restProps
}: ToolbarSelectProps) => {
  return (
    <Select.Root {...restProps}>
      <RadixToolbar.Button asChild>
        <Select.Trigger
          className={`flex flex-row justify-between items-center gap-4 pl-4 pr-2 cursor-pointer ${className}`}
          aria-label="font"
        >
          {title}
        </Select.Trigger>
      </RadixToolbar.Button>
      <Select.Portal>
        <Select.Content
          className="bg-white rounded-lg overflow-hidden py-2"
          position="popper"
          sideOffset={10}
        >
          <Select.Viewport className="">{children}</Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
interface SelectItemsProps {
  value: string;
  icon?: ReactNode;
  label: string;
  className?: string;
}
const ToolbarSelectItem = ({
  value,
  icon,
  label,
  className,
}: SelectItemsProps) => {
  return (
    <Select.Item
      value={value}
      aria-label={label}
      className={`text-gray-500 hover:bg-gray-200 hover:text-black active:bg-gray-300 px-2 py-0.5 cursor-pointer flex flex-row items-center ${className}`}
    >
      <span className="w-4 mr-2">{icon}</span>
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

const ToolbarColorPicker = ({
  color,
  variant = "default",
  onValueChange,
  onValueChangeComplete,
  className,
  customTitle,
}: {
  color?: Color;
  variant?: "default" | "border" | "custom";
  onValueChange?: (value: ColorResult) => void;
  onValueChangeComplete?: (value: ColorResult) => void;
  className?: string;
  customTitle?: ((currentColor: string) => React.ReactNode) | ReactNode;
}) => {
  const [currentColor, setCurrentColor] = useState<Color>(color ?? "");

  useEffect(() => {
    if (color) setCurrentColor(color);
  }, [color]);

  return (
    <ToolbarDropdown
      title={
        variant !== "custom" ? (
          <span
            className={`w-5 h-5 rounded-full block ${className}`}
            style={{
              ...(variant === "default" && {
                backgroundColor: currentColor as string,
              }),
              ...(variant === "border" && {
                border: `3px solid ${currentColor}`,
              }),
            }}
          />
        ) : typeof customTitle === "function" ? (
          customTitle(currentColor as string)
        ) : (
          customTitle
        )
      }
    >
      <SketchPicker
        color={currentColor}
        onChange={(result) => {
          setCurrentColor(result.hex);
          onValueChange?.(result);
        }}
        onChangeComplete={onValueChangeComplete}
      />
    </ToolbarDropdown>
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
      className={`w-[60px] ${className}`}
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

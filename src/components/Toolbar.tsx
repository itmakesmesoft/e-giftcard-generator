import Input, { type InputProps } from "./Input";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import {
  DropdownMenu,
  Toolbar as RadixToolbar,
  Tooltip as RadixTooltip,
} from "radix-ui";
import {
  ToolbarButtonProps,
  ToolbarToggleGroupMultipleProps,
  ToolbarToggleGroupSingleProps,
} from "@radix-ui/react-toolbar";
import { Color, ColorResult, SketchPicker } from "react-color";
import { clearTextSelection } from "./utils";
import Select, { SelectProps } from "./Select";

const Toolbar = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <RadixToolbar.Root
      className={`flex flex-row gap-4 bg-white px-4 py-2 rounded-xl ${className}`}
    >
      <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
    </RadixToolbar.Root>
  );
};

type ToolbarToggleGroupProps = {
  className?: string;
  children: ReactNode;
} & (ToolbarToggleGroupMultipleProps | ToolbarToggleGroupSingleProps);
const ToolbarToggleGroup = ({
  className,
  children,
  ...restProps
}: ToolbarToggleGroupProps) => {
  return (
    <RadixToolbar.ToggleGroup
      className={`flex flex-row items-center ${className}`}
      {...restProps}
    >
      {children}
    </RadixToolbar.ToggleGroup>
  );
};
interface ToggleGroupItemProps {
  icon?: ReactNode;
  value: string;
  label?: string;
  className?: string;
}
const ToolbarToggleGroupItem = ({
  icon,
  value,
  label,
  className,
}: ToggleGroupItemProps) => {
  return (
    <Tooltip label={label}>
      <RadixToolbar.ToggleItem
        value={value}
        aria-label={label}
        className={`cursor-pointer ${className ?? ""}`}
      >
        {icon}
      </RadixToolbar.ToggleItem>
    </Tooltip>
  );
};

type ToolbarSelectProps = SelectProps & {
  label?: string;
};

const ToolbarSelect = ({ label, ...restProps }: ToolbarSelectProps) => (
  <Tooltip label={label}>
    <Select {...restProps} />
  </Tooltip>
);

type ToolbarDropdownProps = DropdownMenu.DropdownMenuProps & {
  title: ReactNode;
  label: string;
  children: ReactNode;
  disabled?: boolean;
};
const ToolbarDropdown = ({
  title,
  label,
  children,
  disabled,
}: ToolbarDropdownProps) => {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) clearTextSelection();
  };

  return (
    <DropdownMenu.Root onOpenChange={handleOpenChange}>
      <RadixToolbar.Button asChild>
        <Tooltip label={label}>
          <DropdownMenu.Trigger
            className={`${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {title}
          </DropdownMenu.Trigger>
        </Tooltip>
      </RadixToolbar.Button>
      {!disabled && (
        <DropdownMenu.Content className="mt-4 py-2 px-4 rounded-xl bg-white">
          {children}
        </DropdownMenu.Content>
      )}
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
  label,
}: {
  color?: Color;
  variant?: "default" | "border" | "custom";
  onValueChange?: (value: ColorResult) => void;
  onValueChangeComplete?: (value: ColorResult) => void;
  className?: string;
  customTitle?: ((currentColor: string) => React.ReactNode) | ReactNode;
  label: string;
}) => {
  const [currentColor, setCurrentColor] = useState<Color>(color ?? "");

  useEffect(() => {
    if (color) setCurrentColor(color);
  }, [color]);

  return (
    <ToolbarDropdown
      label={label}
      title={
        variant !== "custom" ? (
          <span
            className={`border w-5 h-5 rounded-full block ${className}`}
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

const Tooltip = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) clearTextSelection();
  };
  return (
    <RadixTooltip.Root onOpenChange={handleOpenChange}>
      <RadixTooltip.Trigger asChild tabIndex={-1}>
        {children}
      </RadixTooltip.Trigger>
      {label && (
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-black px-2 py-1 rounded-sm text-sm text-white"
            sideOffset={10}
            side="bottom"
          >
            {label}
            <RadixTooltip.Arrow className="fill-black" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      )}
    </RadixTooltip.Root>
  );
};

const ToolbarSeparator = () => (
  <RadixToolbar.Separator className="border border-gray-300" />
);

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { className, children, ...restProps } = props;
  return (
    <RadixToolbar.Button
      className={`cursor-pointer ${className}`}
      {...restProps}
    >
      {children}
    </RadixToolbar.Button>
  );
};

export default Object.assign(Toolbar, {
  Button: ToolbarButton,
  ToggleGroup: ToolbarToggleGroup,
  ToggleGroupItem: ToolbarToggleGroupItem,
  Select: ToolbarSelect,
  Dropdown: ToolbarDropdown,
  ColorPicker: ToolbarColorPicker,
  Input: ToolbarInput,
  Separator: ToolbarSeparator,
  Tooltip: Tooltip,
});

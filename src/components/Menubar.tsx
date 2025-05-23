import { Slot, Menubar as RadixMenubar } from "radix-ui";
import { ChangeEvent, memo, ReactNode } from "react";
import { Tooltip as RadixTooltip } from "radix-ui";
import { clearTextSelection } from "./utils";

const commonStyle = "p-2 w-full aspect-square flex justify-center items-center";

const enabledStyle = "active:bg-gray-200 hover:bg-gray-100 cursor-pointer";

interface MenuProps {
  children?: ReactNode;
}

const Menu = ({ children }: MenuProps) => {
  return <RadixMenubar.Menu>{children}</RadixMenubar.Menu>;
};

interface MenuItemProps {
  icon?: ReactNode;
  label?: string;
  asChild?: boolean;
  id?: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}
const MenuItem = (props: MenuItemProps) => {
  const {
    className: classNameFromProps,
    icon,
    label,
    asChild,
    onClick,
    children,
    active = false,
    disabled = false,
    ...restProps
  } = props;
  const Component = asChild ? Slot.Root : "button";

  return (
    <RadixMenubar.Menu>
      <Tooltip label={label}>
        <Component
          className={`${commonStyle} ${!disabled ? enabledStyle : ""} ${
            active ? "bg-gray-200" : ""
          } ${classNameFromProps ?? ""}`}
          {...restProps}
          aria-label={label}
          onClick={!disabled ? onClick : undefined}
        >
          {icon}
          <Slot.Slottable>{children}</Slot.Slottable>
        </Component>
      </Tooltip>
    </RadixMenubar.Menu>
  );
};

interface MenuGroupProps {
  label?: string;
  id?: string;
  className?: string;
  trigger: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}
const MenuGroup = (props: MenuGroupProps) => {
  const { label, className, trigger, children, onClick, ...restProps } = props;
  return (
    <RadixMenubar.Menu>
      <RadixMenubar.Group className="w-full">
        <Tooltip label={label}>
          <RadixMenubar.Trigger
            aria-label={label}
            onClick={onClick}
            {...restProps}
            asChild
          >
            {trigger}
          </RadixMenubar.Trigger>
        </Tooltip>
        <RadixMenubar.Portal>
          <RadixMenubar.Content
            side="right"
            sideOffset={5}
            className={`min-w-[150px] rounded-lg bg-white flex flex-col gap-1 shadow-xl overflow-hidden ${
              className ?? ""
            }`}
          >
            {children}
          </RadixMenubar.Content>
        </RadixMenubar.Portal>
      </RadixMenubar.Group>
    </RadixMenubar.Menu>
  );
};

interface MenuGroupTriggerProps {
  id?: string;
  className?: string;
  icon?: ReactNode;
}
const MenuGroupTrigger = (props: MenuGroupTriggerProps) => {
  const { icon, ...restProps } = props;
  return (
    <div
      className={`${commonStyle} ${enabledStyle} data-[state="open"]:bg-gray-200`}
      {...restProps}
    >
      {icon}
    </div>
  );
};

interface MenuGroupItemProps {
  icon?: ReactNode;
  id?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  [key: string]: unknown;
}
const MenuGroupItem = (props: MenuGroupItemProps) => {
  const { icon, children, className, asChild = false, ...restProps } = props;
  const Component = asChild ? Slot.Root : RadixMenubar.Item;
  return (
    <Component
      className={`px-3 py-1.5 flex flex-row gap-2 items-center rounded-sm cursor-pointer active:bg-gray-200 hover:bg-gray-100 ${
        className ?? ""
      }`}
      {...restProps}
    >
      {icon}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Component>
  );
};

interface MenuInputFileItemProps {
  id?: string;
  className?: string;
  value?: string | number;
  children?: ReactNode;
  accept?: string;
  label?: string;
  onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}

const MenuInputFileItem = ({
  id,
  className,
  value,
  children,
  accept,
  label,
  onValueChange,
  ...restProps
}: MenuInputFileItemProps) => {
  return (
    <RadixMenubar.Menu>
      <Tooltip label={label}>
        <label
          className={`${commonStyle} ${enabledStyle} ${className}`}
          aria-label={label}
        >
          {children}
          <input
            type="file"
            id={id}
            value={value}
            accept={accept}
            onChange={onValueChange}
            className="hidden"
            {...restProps}
          />
        </label>
      </Tooltip>
    </RadixMenubar.Menu>
  );
};
const MenubarBase = ({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <RadixMenubar.Root
    className={`rounded-2xl bg-white text-black overflow-hidden ${className}`}
  >
    <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
  </RadixMenubar.Root>
);

const Separator = ({ className = "" }: { className?: string }) => (
  <RadixMenubar.Separator
    className={`w-full border-b border-gray-300 ${className}`}
  />
);

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
            sideOffset={5}
            side="right"
          >
            {label}
            <RadixTooltip.Arrow className="fill-black" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      )}
    </RadixTooltip.Root>
  );
};

export const Menubar = Object.assign(memo(MenubarBase), {
  Menu: Menu,
  MenuItem: MenuItem,
  MenuInputFileItem: MenuInputFileItem,
  MenuGroup: MenuGroup,
  MenuGroupTrigger: MenuGroupTrigger,
  MenuGroupItem: MenuGroupItem,
  Separator: Separator,
  Tooltip: Tooltip,
});

Menubar.displayName = "Menubar";

export default Menubar;

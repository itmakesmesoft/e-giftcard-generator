import { Slot, Menubar as RadixMenubar } from "radix-ui";
import { ChangeEvent, memo, ReactNode } from "react";

const commonStyle =
  "p-2 rounded-xl active:bg-gray-200 hover:bg-gray-100 cursor-pointer";

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
    ...restProps
  } = props;
  const Component = asChild ? Slot.Root : "button";

  return (
    <RadixMenubar.Menu>
      <Component
        className={`${commonStyle} border ${
          active ? "border-black" : "border-transparent"
        } ${classNameFromProps ?? ""}`}
        {...restProps}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
        <Slot.Slottable>{children}</Slot.Slottable>
      </Component>
    </RadixMenubar.Menu>
  );
};

interface MenuGroupProps {
  icon?: ReactNode;
  label?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}
const MenuGroup = (props: MenuGroupProps) => {
  const { icon, label, className, children, onClick, ...restProps } = props;
  return (
    <RadixMenubar.Menu>
      <RadixMenubar.Group>
        <RadixMenubar.Trigger
          aria-label={label}
          onClick={onClick}
          className={`${commonStyle} border border-transparent data-[state="open"]:border-black`}
          {...restProps}
        >
          {icon}
        </RadixMenubar.Trigger>
        <RadixMenubar.Portal>
          <RadixMenubar.Content
            side="right"
            sideOffset={20}
            className={`p-2 min-w-[150px] rounded-lg bg-white flex flex-col gap-1 shadow-xl ${
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
      className={`px-2 py-1 flex flex-row gap-2 items-center rounded-sm cursor-pointer active:bg-gray-200 hover:bg-gray-100 ${
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
  icon?: ReactNode;
  accept?: string;
  onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}

const MenuInputFileItem = ({
  id,
  className,
  value,
  icon,
  accept,
  onValueChange,
  ...restProps
}: MenuInputFileItemProps) => {
  return (
    <RadixMenubar.Menu>
      <label className={`${commonStyle} ${className}`}>
        {icon}
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
    </RadixMenubar.Menu>
  );
};
const MenubarBase = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => (
  <RadixMenubar.Root
    className={`py-3 px-2 rounded-2xl bg-white text-black ${className ?? ""}`}
  >
    {children}
  </RadixMenubar.Root>
);

export const Menubar = Object.assign(memo(MenubarBase), {
  Menu: Menu,
  MenuItem: MenuItem,
  MenuInputFileItem: MenuInputFileItem,
  MenuGroup: MenuGroup,
  MenuGroupItem: MenuGroupItem,
  Separator: RadixMenubar.Separator,
});

Menubar.displayName = "Menubar";

export default Menubar;

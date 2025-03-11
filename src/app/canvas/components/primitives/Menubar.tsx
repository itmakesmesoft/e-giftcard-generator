import { Slot, Menubar as RadixMenubar } from "radix-ui";
import { memo, ReactNode } from "react";

interface MenuItemProps {
  icon?: ReactNode;
  label?: string;
  asChild?: boolean;
  id?: string;
  className?: string;
  onClick?: () => void;
}
const MenuItem = (props: MenuItemProps) => {
  const { icon, label, asChild, onClick, ...restProps } = props;
  const Component = asChild ? Slot.Root : "button";
  return (
    <RadixMenubar.Menu>
      <Component {...restProps} aria-label={label} onClick={onClick}>
        {icon}
        {label}
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
  const { icon, label, children, onClick, ...restProps } = props;
  return (
    <RadixMenubar.Menu>
      <RadixMenubar.Group>
        <RadixMenubar.Trigger
          aria-label={label}
          onClick={onClick}
          {...restProps}
        >
          {icon}
          {label}
        </RadixMenubar.Trigger>
        <RadixMenubar.Portal>
          <RadixMenubar.Content side="right">{children}</RadixMenubar.Content>
        </RadixMenubar.Portal>
      </RadixMenubar.Group>
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
const MenuGroupItem = (props: MenuGroupProps) => {
  const { icon, label, children, onClick, ...restProps } = props;
  return (
    <RadixMenubar.Item aria-label={label} onClick={onClick} {...restProps}>
      <span>{icon}</span>
      <span>{children}</span>
      {label}
    </RadixMenubar.Item>
  );
};

const MenubarBase = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => <RadixMenubar.Root className={className}>{children}</RadixMenubar.Root>;

export const Menubar = Object.assign(memo(MenubarBase), {
  Item: MenuItem,
  MenuGroup: MenuGroup,
  MenuGroupItem: MenuGroupItem,
});

Menubar.displayName = "Menubar";

export default Menubar;

import { Toast as RadixToast } from "radix-ui";

interface ToastProps extends RadixToast.ToastProps {
  title?: string;
  description?: string;
  hasCloseButton?: boolean;
}
const Toast = (props: ToastProps) => {
  const { title, description, hasCloseButton, ...restProps } = props;
  return (
    <RadixToast.Root {...restProps}>
      {title && <RadixToast.Title>{title}</RadixToast.Title>}
      {description && (
        <RadixToast.Description>{description}</RadixToast.Description>
      )}
      {hasCloseButton && <RadixToast.Close />}
    </RadixToast.Root>
  );
};

const ToastProvider = RadixToast.Provider;
const ToastViewport = RadixToast.Viewport;

export default Object.assign(Toast, {
  Provider: ToastProvider,
  Viewport: ToastViewport,
});

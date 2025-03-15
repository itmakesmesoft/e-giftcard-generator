const LoadIcon = ({
  width,
  height,
  className,
}: {
  width: string;
  height: string;
  className?: string;
}) => (
  <svg
    fill="currentColor"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.46 10.23C21.4704 10.1537 21.4704 10.0763 21.46 10C21.46 8.067 19.893 6.5 17.96 6.5H13.5C12.9477 6.5 12.5 6.05228 12.5 5.5C12.5 4.83696 12.2366 4.20107 11.7678 3.73223C11.2989 3.26339 10.663 3 10 3H5.75C3.67893 3 2 4.67893 2 6.75V18.02C2.01639 19.5287 3.24123 20.7446 4.75 20.75H17.41C18.5438 20.7449 19.5592 20.0468 19.97 18.99L22.06 12.49C22.2048 11.685 21.985 10.8572 21.46 10.23ZM3.5 6.75C3.5 5.50736 4.50736 4.5 5.75 4.5H10C10.5523 4.5 11 4.94772 11 5.5C11.0055 6.87844 12.1216 7.99452 13.5 8H18C18.8308 7.99989 19.5751 8.51335 19.87 9.29C19.697 9.27495 19.523 9.27495 19.35 9.29H7.15C5.99784 9.29029 4.96802 10.0088 4.57 11.09L3.5 13.87V6.75ZM17.41 19.25C17.9167 19.2494 18.372 18.9405 18.56 18.47L20.64 12.12C20.6779 11.7831 20.5727 11.4457 20.35 11.19C20.1009 10.8989 19.7329 10.737 19.35 10.75H7.15C6.62408 10.7503 6.15365 11.0772 5.97 11.57L3.5 18.12C3.56647 18.7609 4.10571 19.2483 4.75 19.25H17.41Z"
    />
  </svg>
);

export default LoadIcon;

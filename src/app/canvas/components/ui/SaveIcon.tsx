const SaveIcon = ({
  width,
  height,
  className,
}: {
  width: string;
  height: string;
  className: string;
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
      d="M7 3H16L21 8V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3ZM18.7878 18.7878C19.2616 18.3141 19.5254 17.67 19.52 17L19.55 8.64L15.39 4.48H7C6.33002 4.47462 5.68592 4.73839 5.21215 5.21215C4.73839 5.68592 4.47462 6.33002 4.48 7V17C4.47462 17.67 4.73839 18.3141 5.21215 18.7878C5.68592 19.2616 6.33002 19.5254 7 19.52H17C17.67 19.5254 18.3141 19.2616 18.7878 18.7878Z"
    />
    <path d="M13.53 6.59H6.1C5.68579 6.59 5.35 6.92579 5.35 7.34C5.35 7.75421 5.68579 8.09 6.1 8.09H13.53C13.9442 8.09 14.28 7.75421 14.28 7.34C14.28 6.92579 13.9442 6.59 13.53 6.59Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.25407 13.9502C6.58632 13.1534 7.36669 12.6359 8.23 12.64C9.40084 12.64 10.35 13.5891 10.35 14.76C10.354 15.6233 9.83657 16.4037 9.03975 16.7359C8.24292 17.0681 7.32435 16.8866 6.71389 16.2761C6.10343 15.6656 5.92183 14.7471 6.25407 13.9502ZM7.64087 15.0081C7.74155 15.2431 7.97432 15.394 8.23 15.39C8.57403 15.3845 8.85004 15.104 8.85 14.76C8.84997 14.5043 8.69537 14.2739 8.45872 14.177C8.22208 14.0801 7.95034 14.1359 7.77097 14.3182C7.59161 14.5004 7.5402 14.773 7.64087 15.0081Z"
    />
  </svg>
);

export default SaveIcon;

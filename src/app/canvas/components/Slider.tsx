import { ChangeEvent } from "react";

const Slider = (props: {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  value?: number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}) => <input type="range" {...props} />;

export default Slider;

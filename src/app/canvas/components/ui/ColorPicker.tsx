export interface ColorPickerProps {
  color: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorPicker = ({ color, onChange, className }: ColorPickerProps) => (
  <button>
    <input
      className={className}
      type="color"
      value={color}
      onChange={onChange}
    />
  </button>
);

export default ColorPicker;

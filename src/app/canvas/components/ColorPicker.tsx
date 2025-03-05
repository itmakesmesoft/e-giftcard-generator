const ColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <button>
    <input className="w-6 h-6" type="color" value={color} onChange={onChange} />
  </button>
);

export default ColorPicker;

import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import Input from "./Input";

interface StepperContext {
  internalValue: number;
  setInternalValue: (value: SetStateAction<number>) => void;
}
const stepperContext = createContext<StepperContext>({
  internalValue: 0,
  setInternalValue: () => {},
});
const StepperProvider = stepperContext.Provider;

const NumberStepper = ({
  className,
  value,
  onValueChange,
  slotStart,
  slotEnd,
  align = "row",
  unit,
  min,
  max,
}: {
  className?: string;
  value: number;
  onValueChange: (value: number) => void;
  align?: "row" | "column";
  slotStart?: ReactNode;
  slotEnd?: ReactNode;
  unit?: string;
  min?: number;
  max?: number;
}) => {
  const [internalValue, setInternalValue] = useState<number>(value);

  useEffect(() => {
    if (value !== internalValue) {
      onValueChange(internalValue);
    }
  }, [internalValue, onValueChange, value]);

  const handleInputValueChange = (value: unknown) => {
    const numberValue = Number(value);
    setInternalValue(numberValue);
  };

  return (
    <StepperProvider value={{ internalValue, setInternalValue }}>
      <div
        className={`max-w-full relative flex ${
          align === "column" ? "flex-col" : "flex-row"
        } ${className}`}
      >
        {slotStart}
        <Input
          onValueChangeComplete={handleInputValueChange}
          value={internalValue}
          className="appearance-none"
          unit={unit}
          min={min}
          max={max}
        />
        {slotEnd}
      </div>
    </StepperProvider>
  );
};

const IncreaseButton = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  const { setInternalValue } = useContext(stepperContext);
  const handleIncreaseBtnClick = () => setInternalValue((value) => value + 1);
  return (
    <button
      className={`p-1 flex flex-row justify-center items-center ${className}`}
      onClick={handleIncreaseBtnClick}
    >
      {children}
    </button>
  );
};
const DecreaseButton = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  const { setInternalValue } = useContext(stepperContext);
  const handleIncreaseBtnClick = () => setInternalValue((value) => value - 1);
  return (
    <button
      className={`p-1 flex flex-row justify-center items-center ${className}`}
      onClick={handleIncreaseBtnClick}
    >
      {children}
    </button>
  );
};

export default Object.assign(NumberStepper, {
  IncreaseButton,
  DecreaseButton,
});

import { ReaderFormatType } from "@/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Dialog, RadioGroup } from "radix-ui";
import Select from "../ui/Select";
import Input from "../ui/Input";

const BARCODE_FORMAT_LIST = [
  "AZTEC",
  "CODABAR",
  "CODE_39",
  "CODE_93",
  "CODE_128",
  "DATA_MATRIX",
  "EAN_8",
  "EAN_13",
  "ITF",
  "MAXICODE",
  "PDF_417",
  "RSS_14",
  "RSS_EXPANDED",
  "UPC_A",
  "UPC_E",
  "UPC_EAN_EXTENSION",
];

const codeTypeList = [
  { value: "qrcode", label: "QR CODE" },
  {
    value: "barcode",
    label: "BARCODE",
  },
];

const options = BARCODE_FORMAT_LIST.map((item) => ({
  value: item,
  label: item,
}));

type CodeType = "barcode" | "qrcode";
interface BarcodeModalProps {
  trigger: ReactNode;
  onSubmit: (data: { value: string; format: ReaderFormatType }) => void;
}

const BarcodeModal = ({ trigger, onSubmit }: BarcodeModalProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [codeType, setCodeType] = useState<CodeType>("qrcode");
  const valueRef = useRef<string>(null);
  const formatRef = useRef<ReaderFormatType>(null);

  useEffect(() => {
    if (codeType === "qrcode") formatRef.current = "QR_CODE";
  }, [codeType]);

  const handleFormatChange = (value: string) => {
    formatRef.current = value as ReaderFormatType;
  };

  const handleValueChange = (value: string | number) => {
    valueRef.current = value as string;
  };

  const handleClickSubmit = () => {
    setOpen(false);
    if (!valueRef.current || !formatRef.current) return;

    onSubmit({ value: valueRef.current, format: formatRef.current });
  };

  const handleCodeTypeChange = (value: string) => {
    setCodeType(value as CodeType);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-100" />
        <Dialog.Content className="fixed top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] bg-white z-100 rounded-lg p-4">
          <Dialog.Title className="mb-4 font-semibold">
            바코드 정보를 입력해주세요
          </Dialog.Title>
          <div className="flex flex-col">
            <RadioGroup.Root
              defaultValue={codeType}
              onValueChange={handleCodeTypeChange}
              className="flex flex-row gap-2 mb-4"
            >
              {codeTypeList.map((item, index) => (
                <div className="flex flex-row gap-4" key={index}>
                  <RadioGroup.Item
                    id={`radio-${index}`}
                    value={item.value}
                    className="w-4 h-4 rounded-full bg-white hover:bg-blue-200 focus:ring focus:ring-gray-400 flex items-center justify-center"
                  >
                    <RadioGroup.Indicator className="w-2 h-2 bg-blue-500 rounded-full" />
                  </RadioGroup.Item>
                  <label className="Label" htmlFor={`radio-${index}`}>
                    {item.label}
                  </label>
                </div>
              ))}
            </RadioGroup.Root>
            <div>
              {codeType === "qrcode" && (
                <Input
                  label="url"
                  type="text"
                  className="text-start"
                  onValueChange={handleValueChange}
                />
              )}
              {codeType === "barcode" && (
                <div className="flex flex-col gap-2 w-full">
                  <label>
                    <span className="mr-2">format</span>
                    <Select
                      className="z-100 border border-gray-200 rounded-sm"
                      options={options}
                      onValueChange={handleFormatChange}
                    />
                  </label>
                  <Input
                    label="code"
                    type="text"
                    className="text-start"
                    onValueChange={handleValueChange}
                  />
                </div>
              )}
            </div>
            <button onClick={handleClickSubmit}>확인</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BarcodeModal;

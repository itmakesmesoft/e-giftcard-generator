import { ReaderFormatType } from "@/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Dialog, RadioGroup } from "radix-ui";
import Select from "../../../components/Select";
import Input from "../../../components/Input";

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
        <Dialog.Overlay className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-100 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] bg-white z-100 rounded-lg p-6 w-[400px] shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-6 text-gray-800">
            바코드 정보를 입력해주세요
          </Dialog.Title>
          <div className="flex flex-col gap-6">
            <RadioGroup.Root
              defaultValue={codeType}
              onValueChange={handleCodeTypeChange}
              className="flex flex-row gap-6 p-4 bg-gray-50 rounded-lg"
            >
              {codeTypeList.map((item, index) => (
                <div className="flex flex-row items-center gap-2" key={index}>
                  <RadioGroup.Item
                    id={`radio-${index}`}
                    value={item.value}
                    className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center transition-all"
                  >
                    <RadioGroup.Indicator className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  </RadioGroup.Item>
                  <label
                    className="text-gray-700 font-medium cursor-pointer select-none"
                    htmlFor={`radio-${index}`}
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </RadioGroup.Root>
            <div className="space-y-4">
              {codeType === "qrcode" && (
                <Input
                  label="URL"
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  onValueChange={handleValueChange}
                  placeholder="https://example.com"
                />
              )}
              {codeType === "barcode" && (
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Format
                    </label>
                    <Select
                      className="w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      options={options}
                      onValueChange={handleFormatChange}
                    />
                  </div>
                  <Input
                    label="Code"
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    onValueChange={handleValueChange}
                    placeholder="바코드 값을 입력하세요"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleClickSubmit}
                className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BarcodeModal;

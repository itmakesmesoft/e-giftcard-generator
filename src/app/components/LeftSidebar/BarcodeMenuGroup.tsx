import QrIcon from "@/components/assets/QrIcon";
import Menubar from "@/components/Menubar";
import Image from "next/image";
import BarcodeModal from "./BarcodeModal";
import { ChangeEvent } from "react";
import { ReaderFormatType, readCodeByImage } from "@/utils";

interface BarcodeMenuGroupProps {
  onAddBarcode: (data: { format: ReaderFormatType; value: string }) => void;
}

const BarcodeMenuGroup = ({ onAddBarcode }: BarcodeMenuGroupProps) => {
  const handleAddBarcodeWithImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const data = await readCodeByImage(reader.result as string);
      if (!data) return;
      onAddBarcode(data);
    };
  };

  return (
    <Menubar.MenuGroup
      className="p-4 text-center w-[300px]"
      label="QR/바코드 추가"
      trigger={
        <div className="group p-2 pt-4 hover:bg-blue-500 cursor-pointer">
          <QrIcon width="30" height="30" className="group-hover:fill-white" />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-sm overflow-hidden">
          <Image src="/example.png" width="300" height="300" alt="barcode" />
        </div>
        <p className="text-sm break-keep text-center">
          <strong className="font-semibold">
            QR 코드 또는 바코드가 포함된 사진
          </strong>
          을 선택하면 자동으로 캔버스에 추가됩니다.
        </p>
        <Menubar.MenuInputFileItem
          accept="image/*"
          onValueChange={handleAddBarcodeWithImage}
          className="py-2 h-auto rounded-sm !aspect-auto !bg-blue-400 !text-white hover:!bg-blue-500"
        >
          사진 불러오기
        </Menubar.MenuInputFileItem>
        <hr />
        <BarcodeModal
          trigger={
            <button className="py-2 w-full hover:bg-gray-500 active:bg-gray-600 hover:text-white cursor-pointer rounded-sm border border-gray-300">
              코드 또는 URL 입력
            </button>
          }
          onSubmit={onAddBarcode}
        />
      </div>
    </Menubar.MenuGroup>
  );
};

export default BarcodeMenuGroup;

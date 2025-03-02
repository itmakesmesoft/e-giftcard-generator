import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { convertBarcodeFormat } from "./adapter";
import { GeneratableFormatType, ReadableFormatType } from "./type";

interface DataProps {
  value: string;
  format: ReadableFormatType | GeneratableFormatType;
}

interface GenerateCodeProps {
  id: string;
  data: DataProps;
}

export const generateCode = async (props: GenerateCodeProps) => {
  const { data } = props;
  if (data.format === "QR_CODE") {
    return await generateQRCode(props);
  } else {
    return generateBarcode(props);
  }
};

export const generateBarcode = (props: GenerateCodeProps) => {
  const { id, data } = props;
  const canvas = document.getElementById(id);
  if (!canvas) throw Error("Error");

  const format = convertBarcodeFormat(data.format) as GeneratableFormatType;
  if (!format) return console.log("impossible");

  JsBarcode(canvas, data.value, { format });
};

const generateQRCode = async (props: GenerateCodeProps) => {
  const { id, data } = props;
  const canvas = document.getElementById(id);
  QRCode.toCanvas(canvas, data.value);
};

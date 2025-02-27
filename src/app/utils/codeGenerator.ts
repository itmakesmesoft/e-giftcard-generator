import JsBarcode from "jsbarcode";
import { convertBarcodeFormat } from "./adapter";

type FormatType =
  | "CODE128"
  | "CODE128A"
  | "CODE128B"
  | "CODE128C"
  | "EAN13"
  | "EAN8"
  | "EAN5"
  | "EAN2"
  | "UPC"
  | "CODE39"
  | "ITF"
  | "ITF14"
  | "MSI10"
  | "MSI11"
  | "MSI1010"
  | "MSI1110"
  | "Pharmacode"
  | "Codabar";

interface DataProps {
  value: string;
  format: string; //FormatType;
}

export const generateBarcode = (id: string, data: DataProps) => {
  const canvas = document.getElementById(id);
  if (!canvas) throw Error("Error");
  const format = convertBarcodeFormat(data.format) as FormatType;
  if (!format) return console.log("impossible");
  JsBarcode(canvas, data.value, { format });
};

// const generateQRCode = (data: DataProps) => {};

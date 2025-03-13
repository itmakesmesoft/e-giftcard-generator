/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadFromLocalStorage, saveToLocalStorage } from "@/utils";
import { useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONT_API;

const useFonts = () => {
  const [currentFont, setCurrentFont] = useState<string>("");
  const [fontList, setFontList] = useState<any[] | undefined>(undefined);
  const [fontDict, setFontDict] = useState<any>();

  useEffect(() => {
    const setFontListToState = async () => {
      const data = await getFontList();
      const converted = convertToMap(data);

      setFontList(data.length > 30 ? data.slice(0, 30) : data);
      setFontDict(converted ?? {});
    };
    setFontListToState();
  }, []);

  const loadFontFamily = async (fontFamily: string): Promise<boolean> => {
    const fontFiles = fontDict[fontFamily].files;

    try {
      const fontFace = new FontFace(
        fontFamily,
        `url(${fontFiles.regular || fontFiles[0]})`
      );
      await fontFace.load();
      document.fonts.add(fontFace);
      setCurrentFont(fontFamily);
      return true;
    } catch (error) {
      console.error(`폰트 ${fontFamily} 로드 실패`, error);
      return false;
    }
  };

  const getFontList = async () => {
    const key = "fontList";
    const data = loadFromLocalStorage(key);
    if (data) return data;

    const BASE_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&capability=WOFF2`;
    const res = await fetch(BASE_URL)
      .then((res) => res.json())
      .then((data) => {
        saveToLocalStorage(key, data.items);
        return data.items;
      });
    return res;
  };
  const convertToMap = (datas: any[]) => {
    if (!datas) return;
    const obj: Record<string, any> = {};
    console.log(datas);
    datas?.forEach((data) => {
      const { family, ...restData } = data;
      obj[family] = restData;
    });
    return obj;
  };

  return { currentFont, loadFontFamily, fontList, fontDict };
};

export default useFonts;

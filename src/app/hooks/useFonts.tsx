/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadFromLocalStorage, saveToLocalStorage } from "@/utils";
import { useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONT_API;
const BASE_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&capability=WOFF2`;

const useFonts = () => {
  const [fontList, setFontList] = useState<any[]>([]);
  const [fontDict, setFontDict] = useState<any>();

  useEffect(() => {
    const setFontListToState = async () => {
      const data = await getFontList();
      const converted = convertToMap(data);

      setFontList(data);
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
    return await fetch(BASE_URL)
      .then(async (res) => await res.json())
      .then((data) => {
        if (!data) return;
        saveToLocalStorage(key, data.items);
        return data.items;
      })
      .catch((err) => console.error(err));
  };

  const convertToMap = (datas: any[]) => {
    if (!datas) return;

    const obj: Record<string, any> = {};
    datas?.forEach((data) => {
      const { family, ...restData } = data;
      obj[family] = restData;
    });

    return obj;
  };

  return { loadFontFamily, fontList, fontDict };
};

export default useFonts;

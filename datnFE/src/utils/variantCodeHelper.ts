import { ProductVersion } from "../models/productVersion";

export const VERSION_SHORT_CODE: Record<string, string> = {
  [ProductVersion.BODY_ONLY]: "BO",
  [ProductVersion.KIT_18_45]: "K45",
  [ProductVersion.KIT_18_150]: "K150",
};

export function removeAccents(str: string): string {
  const maps: Record<string, string> = {
    àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ: "aaaaaaaaaaaaaaaaeeeeeeeeeeeiiooooooooooooooooouuuuuuuuuuuyyyyyd",
    ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ: "aaaaaaaaaaaaaaaaeeeeeeeeeeeiiooooooooooooooooouuuuuuuuuuuyyyyyd",
  };
  let result = str;
  for (const [from, to] of Object.entries(maps)) {
    for (let i = 0; i < from.length; i++) {
      result = result.replaceAll(from[i], to[i]);
    }
  }
  return result;
}

export function normalizeForCode(text: string): string {
  return removeAccents(text)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

export function generateVariantCode(
  productCode: string,
  versionId: string,
  colorName: string,
  storageName: string
): string {
  const versionCode = VERSION_SHORT_CODE[versionId] ?? versionId.substring(0, 2);
  const colorCode = normalizeForCode(colorName);
  const storageCode = normalizeForCode(storageName);
  return `${productCode}-${versionCode}-${colorCode}-${storageCode}`;
}

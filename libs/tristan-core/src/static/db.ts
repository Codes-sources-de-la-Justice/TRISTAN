import { RawAnalysis } from "./model";
import { files as tgcmIndex } from './tgcm';

function baseName(x: string): string {
  const parts = x.split("/");
  return parts[parts.length - 1];
}

function processTgcmEntry([filename, json]: [string, RawAnalysis]): [
  string,
  RawAnalysis
] {
  const baseFileName = baseName(filename);
  return [baseFileName.substring(0, baseFileName.length - 5), json];
}
export const db = Object.fromEntries(
  (tgcmIndex as [string, RawAnalysis][]).map(processTgcmEntry)
);

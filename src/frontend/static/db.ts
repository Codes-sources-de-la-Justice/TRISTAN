import { RawAnalysis } from "./model";

function baseName(x: string): string {
  const parts = x.split("/");
  return parts[parts.length - 1];
}

// @ts-ignore
const tgcmFiles: Object = import.meta.globEager("./tgcm/*.json");
function processTgcmEntry([filename, json]: [string, RawAnalysis]): [
  string,
  RawAnalysis
] {
  const baseFileName = baseName(filename);
  return [baseFileName.substr(0, baseFileName.length - 5), json];
}
export const db = Object.fromEntries(
  Object.entries(tgcmFiles).map(processTgcmEntry)
);

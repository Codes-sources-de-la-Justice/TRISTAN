import { RawAnalysis } from "./model";

// @ts-ignore
const TGCMFiles = require.context("./tgcm", true, /^(.*\.(json$))[^.]*$/im);

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
  // TODO: type require.context!
  // @ts-ignore
  TGCMFiles.keys().map(key => [key, TGCMFiles(key)]).map(processTgcmEntry)
);

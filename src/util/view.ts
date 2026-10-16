export type ViewMode = "RADAR" | "GRID" | "ORBIT";
export type ViewParam = "map" | "directory" | "online";

export const VIEW_TO_PARAM: Record<ViewMode, ViewParam> = {
  RADAR: "map",
  GRID: "directory",
  ORBIT: "online",
};

export const PARAM_TO_VIEW: Record<string, ViewMode> = {
  map: "RADAR",
  radar: "RADAR",
  directory: "GRID",
  grid: "GRID",
  online: "ORBIT",
  orbit: "ORBIT",
};

export function parseViewParam(param?: string | string[] | null): ViewMode {
  if (!param) return "RADAR";
  const val = (Array.isArray(param) ? param[0] : param).toLowerCase();
  return PARAM_TO_VIEW[val] || "RADAR";
}

export type ExecuteTermuxCommandOptions = {
  commandPath: string;
  args?: string[];
  workingDir?: string;
  inBackground?: boolean;
};

export type ExpoTermuxModuleEvents = Record<string, never>;

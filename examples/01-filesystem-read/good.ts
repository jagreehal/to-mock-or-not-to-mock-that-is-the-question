export type FileReader = {
  readFile(path: string, encoding: string): Promise<string>;
};

export async function readConfig(path: string, deps: FileReader) {
  const text = await deps.readFile(path, "utf8");
  return JSON.parse(text);
}

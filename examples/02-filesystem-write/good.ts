export type ReportStore = {
  save(path: string, contents: string): Promise<void>;
};

export async function saveReport(name: string, contents: string, store: ReportStore) {
  await store.save(`./reports/${name}.txt`, contents);
}

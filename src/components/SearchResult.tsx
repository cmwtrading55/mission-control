import { format } from "date-fns";

export type SearchResultItem = {
  _id?: string;
  title?: string;
  content?: string;
  sourcePath?: string;
  timestamp?: number;
  resultType: string;
};

function highlight(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark class='bg-emerald-500/20 text-emerald-200'>$1</mark>");
}

export function SearchResult({ result, query }: { result: SearchResultItem; query: string }) {
  const snippet = result.content ?? result.sourcePath ?? "";
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">
          {result.title ?? result.sourcePath ?? "Untitled"}
        </h3>
        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
          {result.resultType}
        </span>
      </div>
      {result.timestamp && (
        <p className="mt-1 text-xs text-slate-400">{format(result.timestamp, "PPpp")}</p>
      )}
      <p
        className="mt-3 text-sm text-slate-300"
        dangerouslySetInnerHTML={{
          __html: highlight(snippet.slice(0, 220), query),
        }}
      />
    </div>
  );
}

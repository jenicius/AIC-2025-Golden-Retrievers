import React from "react";
import "./QueryView.css";
import { type QueryItem, readQueryFromFolder } from "../../utils/readQuery";

export default function QueryView() {
  const [queries, setQueries] = React.useState<QueryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchQueries() {
      try {
        const data = await readQueryFromFolder();
        if (data?.queries_names && data?.queries_text) {
          const names: string[] = data.queries_names;
          const texts: string[] = data.queries_text;

          const zipped: QueryItem[] = names.map((name, i) => ({
            name,
            text: texts[i] ?? "",
          }));

          zipped.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
          );

          if (mounted) {
            setQueries(zipped);
            setSelectedIndex(0);
            window.dispatchEvent(
              new CustomEvent("querySelected", { detail: zipped[0] })
            );
          }
        }
      } catch (error) {
        console.error("Error fetching queries:", error);
        if (mounted) setQueries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchQueries();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedQuery = selectedIndex !== null ? queries[selectedIndex] : null;

  React.useEffect(() => {
    if (selectedQuery) {
      window.dispatchEvent(
        new CustomEvent("querySelected", { detail: selectedQuery })
      );
    }
  }, [selectedQuery]);

  return (
    <div className="query-view">
      {loading ? (
        <div className="query-loading">Loading queries...</div>
      ) : queries.length === 0 ? (
        <div className="query-empty">No queries found</div>
      ) : (
        <>
          <div className="query-dropdown">
            <label>Select a query:</label>
            <select
              id="query-select"
              value={selectedIndex ?? ""}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
            >
              {queries.map((query, idx) => (
                <option key={idx} value={idx}>
                  {query.name}
                </option>
              ))}
            </select>
          </div>

          {selectedQuery && (
            <div className="query-display">
              <pre className="query-text">{selectedQuery.text}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

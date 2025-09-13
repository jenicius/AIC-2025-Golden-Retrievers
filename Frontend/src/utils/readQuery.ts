export type QueryItem = {
  text: string;
  name: string;
};

export async function readQueryFromFolder() {
  const res = await fetch("http://127.0.0.1:8000/api/query/read_queries", {
    method: "POST", // ✅ match your backend
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // send data if backend expects it
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch queries: ${res.status}`);
  }

  return res.json();
}

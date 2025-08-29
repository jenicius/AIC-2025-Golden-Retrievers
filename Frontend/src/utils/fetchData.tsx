
export async function queryByText(
  text: string,
  topK: number,
  model: string,
  metric: string
) {
  const res = await fetch("http://127.0.0.1:8000/text", {
    method: "POST",                     // or "GET" depending on your API
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      topK,
      model,
      metric,
    }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  console.log(data);
  return data;
}

export function queryByImage(image: File, topK: number, model: string, metric: string) {
    // const formData = new FormData();
    // formData.append("image", image);
    // formData.append("topK", topK.toString());
    // formData.append("model", model);
    // formData.append("metric", metric);

    // return fetch(`/api/query/image`, {
    //     method: "POST",
    //     body: formData,
    // });
}

export function queryByOCR(text: string, topK: number, model: string, metric: string) {

}

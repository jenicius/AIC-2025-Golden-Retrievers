
export function queryByText(text: string, topK: number, model: string, metric: string) {
//   return fetch(`/api/query/text`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ text, topK, model, metric }),
//   });
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

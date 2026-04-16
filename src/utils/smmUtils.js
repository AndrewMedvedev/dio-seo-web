export const formatNumber = (value) =>
  new Intl.NumberFormat("ru-RU").format(Number(value || 0));

export const formatDate = (unixTs) => {
  const value = Number(unixTs || 0);
  if (!value) return "-";
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function getImageDataUrl(generateResult) {
  if (!generateResult?.generated_image_base64) return "";
  const mime = generateResult.generated_image_mime_type || "image/png";
  return `data:${mime};base64,${generateResult.generated_image_base64}`;
}

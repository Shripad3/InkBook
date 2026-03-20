export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDepositAmount(
  type: "fixed" | "percentage",
  value: number,
  basePrice?: number
): string {
  if (type === "fixed") return formatCurrency(value);
  if (basePrice) return formatCurrency((basePrice * value) / 100);
  return `${value}%`;
}

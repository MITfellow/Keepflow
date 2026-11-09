const numberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.max(0, Math.trunc(value)));
}

export function formatPosition(value: number): string {
  return `#${formatNumber(value)}`;
}

export function formatOrdinal(value: number): string {
  const absolute = Math.abs(Math.trunc(value));
  const lastTwo = absolute % 100;

  if (lastTwo >= 11 && lastTwo <= 13) return `${absolute}th`;

  switch (absolute % 10) {
    case 1:
      return `${absolute}st`;
    case 2:
      return `${absolute}nd`;
    case 3:
      return `${absolute}rd`;
    default:
      return `${absolute}th`;
  }
}

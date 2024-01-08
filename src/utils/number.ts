export const numberFormat = (n: number) => new Intl.NumberFormat('en-IN', {maximumFractionDigits: 2}).format(n)

/** Paleta para gráficos em Relatórios — contrasta bem com fundo escuro. */
export const REPORTS_CHART_PALETTE = [
  "hsl(42, 52%, 53%)", // âmbar (marca)
  "hsl(199, 85%, 55%)", // azul céu
  "hsl(350, 65%, 58%)", // coral
  "hsl(158, 60%, 48%)", // esmeralda
  "hsl(263, 70%, 62%)", // violeta
  "hsl(28, 88%, 55%)", // laranja
  "hsl(173, 55%, 48%)", // teal
  "hsl(291, 47%, 52%)", // magenta suave
] as const;

/** Cor da linha de faturamento (distinta das barras mensais). */
export const REPORTS_REVENUE_LINE = "hsl(172, 66%, 52%)";

export function reportChartColor(index: number): string {
  return REPORTS_CHART_PALETTE[index % REPORTS_CHART_PALETTE.length];
}

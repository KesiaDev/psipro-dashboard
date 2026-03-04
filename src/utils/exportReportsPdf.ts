import { jsPDF } from "jspdf";
import { toast } from "sonner";

export interface ReportsExportData {
  stats: { totalSessions: number; activePatients: number; returnRate: number; avgHoursPerWeek: number };
  topPatients: { name: string; sessions: number; percentage: number }[];
  monthlySessions: { month: string; sessoes: number }[];
  revenueData: { month: string; valor: number }[];
  typeData: { name: string; value: number }[];
}

export async function exportReportsToPdf(
  data: ReportsExportData,
  containerRef: HTMLElement | null
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Título
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório PsiPro", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), pageWidth / 2, y, { align: "center" });
    y += 15;

    // Resumo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Sessões: ${data.stats.totalSessions}`, 14, y);
    y += 6;
    doc.text(`Pacientes Ativos: ${data.stats.activePatients}`, 14, y);
    y += 6;
    doc.text(`Taxa de Retorno: ${data.stats.returnRate}%`, 14, y);
    y += 6;
    doc.text(`Média por Semana: ${data.stats.avgHoursPerWeek}h`, 14, y);
    y += 12;

    // Top Pacientes
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Pacientes Mais Ativos", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (data.topPatients.length > 0) {
      data.topPatients.forEach((p, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${i + 1}. ${p.name} - ${p.sessions} sessões (${p.percentage}%)`, 14, y);
        y += 6;
      });
    } else {
      doc.text("Nenhum dado disponível", 14, y);
      y += 6;
    }
    y += 10;

    // Sessões por Mês
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Sessões por Mês", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (data.monthlySessions.length > 0) {
      data.monthlySessions.forEach((m) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${m.month}: ${m.sessoes} sessões`, 14, y);
        y += 6;
      });
    } else {
      doc.text("Nenhum dado disponível", 14, y);
      y += 6;
    }
    y += 10;

    // Faturamento
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Faturamento (R$)", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (data.revenueData.length > 0) {
      data.revenueData.forEach((r) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${r.month}: R$ ${r.valor.toLocaleString("pt-BR")}`, 14, y);
        y += 6;
      });
    } else {
      doc.text("Nenhum dado disponível", 14, y);
      y += 6;
    }

    doc.save(`relatorio-psipro-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF exportado com sucesso");
  } catch (err) {
    console.error("Erro ao exportar PDF:", err);
    toast.error("Erro ao exportar PDF");
  }
}

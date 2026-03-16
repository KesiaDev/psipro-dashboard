/**
 * Anamnese - estrutura personalizável para psicólogos e terapeutas.
 * Padrão inicial com itens comuns + opção "Outro" para campos customizados.
 */

export interface AnamnesisItem {
  key: string;
  label: string;
  value: string;
  /** true = campo customizado adicionado pelo profissional */
  isCustom?: boolean;
}

export interface AnamnesisData {
  items: AnamnesisItem[];
  /** timestamp da última atualização */
  updatedAt?: string;
}

/** Template padrão - itens que psicólogos/terapeutas costumam precisar */
export const DEFAULT_ANAMNESIS_ITEMS: Omit<AnamnesisItem, "value">[] = [
  { key: "historia_pessoal", label: "História pessoal" },
  { key: "queixa_principal", label: "Queixa principal" },
  { key: "motivo_consulta", label: "Motivo da consulta" },
  { key: "hipotese_observacao", label: "Hipótese / Observação clínica" },
  { key: "antecedentes_familiares", label: "Antecedentes familiares" },
  { key: "historico_tratamentos", label: "Histórico de tratamentos anteriores" },
  { key: "uso_medicacoes", label: "Uso de medicações" },
  { key: "funcionamento_social", label: "Funcionamento social e profissional" },
  { key: "expectativas_terapia", label: "Expectativas em relação à terapia" },
  { key: "sono_alimentacao", label: "Sono e alimentação" },
  { key: "substancias", label: "Uso de álcool, tabaco ou outras substâncias" },
  { key: "outras_informacoes", label: "Outras informações" },
];

export function createDefaultAnamnesis(): AnamnesisData {
  return {
    items: DEFAULT_ANAMNESIS_ITEMS.map((item) => ({
      ...item,
      value: "",
      isCustom: item.isCustom ?? false,
    })),
    updatedAt: new Date().toISOString(),
  };
}

export function parseAnamnesisFromPatient(raw: unknown): AnamnesisData {
  if (!raw || typeof raw !== "object") return createDefaultAnamnesis();
  const data = raw as Record<string, unknown>;
  const itemsRaw = data.items;
  if (!Array.isArray(itemsRaw)) return createDefaultAnamnesis();

  const byKey = new Map<string, AnamnesisItem>();
  const customItems: AnamnesisItem[] = [];

  for (const x of itemsRaw) {
    if (!x || typeof x !== "object") continue;
    const item: AnamnesisItem = {
      key: String((x as Record<string, unknown>).key ?? ""),
      label: String((x as Record<string, unknown>).label ?? ""),
      value: String((x as Record<string, unknown>).value ?? ""),
      isCustom: Boolean((x as Record<string, unknown>).isCustom),
    };
    if (!item.key || !item.label) continue;
    if (item.isCustom) customItems.push(item);
    else byKey.set(item.key, item);
  }

  const standardKeys = new Set(DEFAULT_ANAMNESIS_ITEMS.map((i) => i.key));
  const items: AnamnesisItem[] = [];
  for (const def of DEFAULT_ANAMNESIS_ITEMS) {
    const existing = byKey.get(def.key);
    items.push(
      existing ?? {
        key: def.key,
        label: def.label,
        value: "",
        isCustom: false,
      }
    );
  }
  items.push(...customItems);

  return {
    items,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return n.toLocaleString('pt-BR');
}

export function fmtReais(n: number): string {
  if (n >= 1e6) return 'R$ ' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return 'R$ ' + (n / 1e3).toFixed(1) + 'k';
  return 'R$ ' + Math.round(n);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function formatDateBR(dateStr: string, short = false): string {
  const dt = new Date(dateStr + 'T12:00:00');
  const [y, m, d] = dateStr.split('-');
  const dias = short ? DIAS_CURTO : DIAS_SEMANA;
  return `${dias[dt.getDay()]}, ${d}/${m}/${y}`;
}

export type PlanDurationUnit = 'MESES' | 'DIAS';

export interface PlanDateRange {
  fechaInicio: string;
  fechaFin: string;
}

export function getTodayDateOnly(): string {
  return formatDateOnly(new Date());
}

export function normalizeDateOnly(value: string): string {
  const parsedDate = parseDateOnly(value);
  return parsedDate ? formatDateOnly(parsedDate) : value;
}

export function buildPlanDateRange(
  fechaInicio: string,
  duracion: number,
  unidad: PlanDurationUnit,
): PlanDateRange {
  const normalizedStartDate = normalizeDateOnly(fechaInicio);

  return {
    fechaInicio: normalizedStartDate,
    fechaFin: addDurationToDateOnly(normalizedStartDate, duracion, unidad),
  };
}

function addDurationToDateOnly(
  fechaInicio: string,
  duracion: number,
  unidad: PlanDurationUnit,
): string {
  const parsedDate = parseDateOnly(fechaInicio);

  if (!parsedDate) {
    return fechaInicio;
  }

  if (unidad === 'DIAS') {
    parsedDate.setDate(parsedDate.getDate() + duracion);
  } else {
    parsedDate.setMonth(parsedDate.getMonth() + duracion);
  }

  return formatDateOnly(parsedDate);
}

function parseDateOnly(value: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

function formatDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

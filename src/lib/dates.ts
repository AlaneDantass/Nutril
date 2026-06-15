// Get start of the week (Monday) for a given date, formatted as YYYY-MM-DD
export function getMondayOfDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust so Sunday is 6, Monday is 0, Tuesday is 1, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return formatDateISO(monday);
}

// Format Date object as YYYY-MM-DD in local time
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate an array of 7 dates (YYYY-MM-DD) starting from a specific Monday
export function getWeekDays(mondayStr: string): string[] {
  const days: string[] = [];
  const start = new Date(mondayStr + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(start);
    nextDay.setDate(start.getDate() + i);
    days.push(formatDateISO(nextDay));
  }
  return days;
}

// Format YYYY-MM-DD string to readable Portuguese weekday
export function getWeekdayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];
  return weekdays[d.getDay()];
}

// Format YYYY-MM-DD string to readable day and month (e.g., "15 Jun")
export function getShortDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// Get full readable date in Portuguese (e.g., "Segunda-feira, 15 de Junho")
export function getFullDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
}

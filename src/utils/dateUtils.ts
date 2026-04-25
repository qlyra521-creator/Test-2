import { START_DATE } from '../types';

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function dayOfJourney(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return daysBetween(START_DATE, d) + 1;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateEN(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateStr(new Date());
}

export function isFuture(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00') > new Date();
}

export function isBeforeStart(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00') < START_DATE;
}

export const MONTH_NAMES_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface MonthGroup {
  year: number;
  month: number; // 0-indexed
  rowIdx: number; // which year row
  colIdx: number; // 0-11 within the row
  label: string;
  daysCount: number;
}

export function generateMonthGroups(): MonthGroup[] {
  const groups: MonthGroup[] = [];
  // Start from April 2024 (start month)
  let year = 2024;
  let month = 3; // April = 3
  const today = new Date();
  // Go until 2 months past today to allow future planning
  const endYear = today.getFullYear();
  const endMonth = today.getMonth() + 2;

  let totalMonths = 0;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    const rowIdx = Math.floor(totalMonths / 12);
    const colIdx = totalMonths % 12;
    groups.push({
      year,
      month,
      rowIdx,
      colIdx,
      label: MONTH_NAMES_EN[month],
      daysCount: getDaysInMonth(year, month),
    });
    totalMonths++;
    month++;
    if (month > 11) { month = 0; year++; }
  }
  return groups;
}

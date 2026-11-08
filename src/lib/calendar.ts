/** Fechas locales de interfaz, separadas de los hechos del motor. */
export function dateKey(date: Date): string {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function moveDays(date: Date, amount: number): Date {
 const result = new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
 result.setDate(result.getDate()+amount);
 return result;
}
export function weekDays(date: Date): Date[] {
 const monday=moveDays(date,-((date.getDay()+6)%7));
 return Array.from({length:7},(_,index)=>moveDays(monday,index));
}
export function validDateKey(value: string): boolean {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const [year,month,day]=value.split('-').map(Number);
 return year>=1000 && dateKey(new Date(year,month-1,day,12))===value;
}

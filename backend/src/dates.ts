export function localDate(input?:string){const s=input||new Date().toISOString().slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Invalid date'); return new Date(`${s}T00:00:00.000Z`)}
export function dateString(d:Date){return d.toISOString().slice(0,10)}
export function todayString(){return new Date().toLocaleDateString('en-CA')}

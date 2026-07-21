// Short, stable display code for a work order id (e.g. MNT-3F9A).
export function woCode(id) {
  if (!id) return 'MNT-—';
  const tail = String(id).replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `MNT-${tail}`;
}

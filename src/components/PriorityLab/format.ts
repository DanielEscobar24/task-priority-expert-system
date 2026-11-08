export const formatCF = (value: number) => value.toFixed(4).replace('.', ',');
export const factChoices = {
  importancia: ['alta', 'media', 'baja'],
  esfuerzo: ['alto', 'medio', 'bajo'],
} as const;

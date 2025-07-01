export enum TamanoMascota {
  PEQUENO = 1,
  MEDIANO = 2,
  GRANDE = 3,
}

/**
 * Array de opciones para componentes de UI como QSelect.
 */
export const OPCIONES_TAMANO_MASCOTA = [
  { label: 'PEQUEÑO', value: TamanoMascota.PEQUENO },
  { label: 'MEDIANO', value: TamanoMascota.MEDIANO },
  { label: 'GRANDE', value: TamanoMascota.GRANDE },
]
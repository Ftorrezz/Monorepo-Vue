// Tipos de muestra disponibles en laboratorio
export enum TipoMuestra {
  SANGRE = 'sangre',
  ORINA = 'orina',
  HECES = 'heces',
  FLUIDO = 'fluido',
  BIOPSIA = 'biopsia',
  CULTIVO = 'cultivo',
  CITOLOGIA = 'citologia',
  HISTOLOGIA = 'histologia',
  LIQUIDO_SINOVIAL = 'liquido_sinovial',
  LIQUIDO_CEFALORRAQUIDEO = 'liquido_cefalorraquideo',
  EXUDADO = 'exudado',
  RASPADO = 'raspado'
}

// Estados de la orden
export enum EstadoOrden {
  BORRADOR = 'borrador',
  GENERADA = 'generada',
  RECEPCIONADA = 'recepcionada',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada'
}

// Estados de resultado
export enum EstadoResultado {
  PENDIENTE = 'pendiente',
  CARGADO = 'cargado',
  VALIDADO = 'validado',
  RECHAZADO = 'rechazado',
  ENMENDADO = 'enmendado'
}

export interface Muestra {
  id?: string
  numeroMuestra: string
  tipoMuestra: TipoMuestra
  descripcion: string
  estado: 'generada' | 'etiquetada' | 'recepcionada' | 'procesada'
  fechaGeneracion: string
  fechaRecepcion?: string
  observaciones?: string
}

export interface Estudio {
  id?: string
  codigo: string
  nombre: string
  descripcion?: string
  tipoMuestra: TipoMuestra
  metodologia?: string
  requiereAyuno?: boolean
  requiereConservador?: string
  duracionEstimada?: number // en minutos
  prioridad: 'normal' | 'urgente'
  estado: EstadoResultado
  resultado?: ResultadoEstudio
  muestra?: Muestra
  pruebas?: Prueba[]
}

export interface Prueba {
  id?: string
  codigo: string
  nombre: string
  unidadMedida?: string
  tipoResultado: 'numerico' | 'cualitativo' | 'texto'
  valorReferencia?: string // Valor de referencia simple (deprecated, usar valoresReferencia del config)
  resultado?: ResultadoEstudio
  metodoUtilizado?: string
  observaciones?: string
}

export interface ResultadoEstudio {
  id?: string
  valor?: string
  unidad?: string
  referencia?: string
  estado: EstadoResultado
  observaciones?: string
  fechaCarga?: string
  usuarioCarga?: string
  fechaValidacion?: string
  usuarioValidacion?: string
  validoReferencia?: boolean
  pruebaId?: string
  estudiosId?: string
}

export interface OrdenLaboratorio {
  id?: string
  numeroOrden: string
  paciente: string
  pacienteId?: string
  especie?: string
  edad?: number
  sexo?: string
  raza?: string
  diagnostico?: string
  indicacionesEspeciales?: string
  observaciones?: string
  profesionalSolicitante: string
  profesionalId?: string
  esUrgente: boolean
  estado: EstadoOrden
  estudios: Estudio[]
  muestras: Muestra[]
  fechaCreacion: string
  fechaRecepcion?: string
  fechaComplecion?: string
  usuarioCreador?: string
  usuarioRecepcion?: string
  usuarioComplecion?: string
  notasInternas?: string
}

export interface ConfiguracionMuestra {
  tipoMuestra: TipoMuestra
  prefijo: string // Ej: "S" para sangre, "O" para orina
  contenedor?: string
  volumenMinimo?: string
  conservador?: string
  temperatura?: string
  estabilidad?: string // Ej: "2 horas a temperatura ambiente"
  instruccionesEspeciales?: string[]
}

export type GeneradorMuestrasConfig = Partial<Record<TipoMuestra, ConfiguracionMuestra>>

export interface NumeroMuestraGenerado {
  numeroMuestra: string
  tipoMuestra: TipoMuestra
  codigoOrden: string
  secuencia: number
}

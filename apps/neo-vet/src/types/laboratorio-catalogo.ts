// ============================================================================
// TIPOS PARA CATÁLOGOS DE LABORATORIO
// ============================================================================

// TIPOS DE MUESTRA
export interface TipoMuestra {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  requiereAyuno: boolean
  requiereRefrigeracion: boolean
  tiempoExpiracion: number // en horas
  instruccionesRecoleccion: string
  estado: 'activo' | 'inactivo'
  creado?: Date
  actualizado?: Date
}

// ESTUDIOS (Pruebas solicitadas por el veterinario)
export interface Estudio {
  id: number
  codigo: string
  nombre: string
  categoria: 'Hematología' | 'Química Clínica' | 'Urianálisis' | 'Parasitología' | 'Microbiología' | 'Inmunología' | 'Citología' | 'Serología' | 'Virología' | 'Otro'
  descripcion: string
  costo: number
  tiempoResultado: number // en horas
  frecuenciaUso?: number // contador de usos
  estado: 'activo' | 'inactivo'
  creado?: Date
  actualizado?: Date
}

// PRUEBAS (Tests específicos dentro de un estudio)
export interface Prueba {
  id: number
  idEstudio: number
  codigo: string
  nombre: string
  unidadMedida: string
  decimalesPermitidos: number
  metodoMedicion?: string
  notas?: string
  estado: 'activo' | 'inactivo'
  creado?: Date
  actualizado?: Date
}

// ESPECIES
export enum Especie {
  CANINO = 'canino',
  FELINO = 'felino',
  EQUINO = 'equino',
  BOVINO = 'bovino',
  OVINO = 'ovino',
  PORCINO = 'porcino',
  AVE = 'ave',
  ROEDOR = 'roedor',
  REPTIL = 'reptil'
}

// SEXOS
export enum Sexo {
  MACHO = 'macho',
  HEMBRA = 'hembra'
}

// VALORES DE REFERENCIA (Por especie, edad, peso, sexo)
export interface ValorReferencia {
  id: number
  idPrueba: number
  especie: Especie
  sexo?: Sexo // Opcional: "indistinto" si aplica para ambos
  edadMinima?: number // en años
  edadMaxima?: number // en años
  pesoMinimo?: number // en kg
  pesoMaximo?: number // en kg
  valorMinimo: number
  valorMaximo: number
  // Alertas para visualización
  alertaMinima?: number // valor crítico bajo
  alertaMaxima?: number // valor crítico alto
  observaciones?: string
  estado: 'activo' | 'inactivo'
  creado?: Date
  actualizado?: Date
}

// CATEGORÍAS DE ESTUDIO
export enum CategoriaEstudio {
  HEMATOLOGIA = 'Hematología',
  QUIMICA = 'Química Clínica',
  URIANALIS = 'Urianálisis',
  PARASITOLOGIA = 'Parasitología',
  MICROBIOLOGIA = 'Microbiología',
  INMUNOLOGIA = 'Inmunología',
  CITOLOGIA = 'Citología',
  SEROLOGIA = 'Serología',
  VIROLOGIA = 'Virología',
  OTRO = 'Otro'
}

// DTO para crear/actualizar (sin id ni timestamps)
export type CreateEstudio = Omit<Estudio, 'id' | 'creado' | 'actualizado'>
export type CreatePrueba = Omit<Prueba, 'id' | 'creado' | 'actualizado'>
export type CreateValorReferencia = Omit<ValorReferencia, 'id' | 'creado' | 'actualizado'>
export type CreateTipoMuestra = Omit<TipoMuestra, 'id' | 'creado' | 'actualizado'>

// Respuesta paginada para listas
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Estadísticas de catálogos
export interface EstadisticasCatalogos {
  totalEstudios: number
  totalPruebas: number
  totalValoresReferencia: number
  totalTiposMuestra: number
  estudiosActivos: number
  pruebasActivas: number
  especiesRegistradas: number
  ultimaActualizacion: Date
}

/**
 * ESTRUCTURA BACKEND NECESARIA - NestJS
 *
 * Este archivo documenta qué necesitas implementar en el backend (NestJS)
 * para que el frontend se comunique correctamente.
 *
 * Ubicación recomendada:
 * src/modules/laboratorio-catalogo/
 *   ├── controllers/
 *   ├── services/
 *   ├── entities/
 *   ├── dtos/
 *   └── laboratorio-catalogo.module.ts
 */

// ============================================================================
// 1. ENTIDADES (Database)
// ============================================================================

/**
 * TipoMuestraEntity (tabla: tipos_muestra)
 *
 * CREATE TABLE tipos_muestra (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   codigo VARCHAR(50) UNIQUE NOT NULL,
 *   nombre VARCHAR(255) NOT NULL,
 *   descripcion TEXT,
 *   requiere_ayuno BOOLEAN DEFAULT FALSE,
 *   requiere_refrigeracion BOOLEAN DEFAULT FALSE,
 *   tiempo_expiracion INT NOT NULL DEFAULT 24,
 *   instrucciones_recoleccion TEXT,
 *   estado ENUM('activo', 'inactivo') DEFAULT 'activo',
 *   creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */
export class TipoMuestraEntity {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  requiereAyuno: boolean
  requiereRefrigeracion: boolean
  tiempoExpiracion: number
  instruccionesRecoleccion: string
  estado: 'activo' | 'inactivo'
  creado: Date
  actualizado: Date
}

/**
 * EstudioEntity (tabla: estudios)
 *
 * CREATE TABLE estudios (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   codigo VARCHAR(50) UNIQUE NOT NULL,
 *   nombre VARCHAR(255) NOT NULL,
 *   categoria VARCHAR(100) NOT NULL,
 *   descripcion TEXT,
 *   costo DECIMAL(10,2) NOT NULL,
 *   tiempo_resultado INT NOT NULL,
 *   frecuencia_uso INT DEFAULT 0,
 *   estado ENUM('activo', 'inactivo') DEFAULT 'activo',
 *   creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_codigo (codigo),
 *   INDEX idx_categoria (categoria),
 *   INDEX idx_estado (estado)
 * );
 */
export class EstudioEntity {
  id: number
  codigo: string
  nombre: string
  categoria: string
  descripcion: string
  costo: number
  tiempoResultado: number
  frecuenciaUso?: number
  estado: 'activo' | 'inactivo'
  creado: Date
  actualizado: Date
  pruebas?: PruebaEntity[]
}

/**
 * PruebaEntity (tabla: pruebas)
 *
 * CREATE TABLE pruebas (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   id_estudio INT NOT NULL,
 *   codigo VARCHAR(50) NOT NULL,
 *   nombre VARCHAR(255) NOT NULL,
 *   unidad_medida VARCHAR(50) NOT NULL,
 *   decimales_permitidos INT DEFAULT 2,
 *   metodo_medicion VARCHAR(255),
 *   notas TEXT,
 *   estado ENUM('activo', 'inactivo') DEFAULT 'activo',
 *   creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   FOREIGN KEY (id_estudio) REFERENCES estudios(id) ON DELETE CASCADE,
 *   INDEX idx_estudio (id_estudio),
 *   INDEX idx_codigo (codigo),
 *   UNIQUE KEY uq_estudio_codigo (id_estudio, codigo)
 * );
 */
export class PruebaEntity {
  id: number
  idEstudio: number
  codigo: string
  nombre: string
  unidadMedida: string
  decimalesPermitidos: number
  metodoMedicion?: string
  notas?: string
  estado: 'activo' | 'inactivo'
  creado: Date
  actualizado: Date
  estudio?: EstudioEntity
}

/**
 * ValorReferenciaEntity (tabla: valores_referencia)
 *
 * CRITICAL: Esta es la tabla más importante - define rangos normales
 *
 * CREATE TABLE valores_referencia (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   id_prueba INT NOT NULL,
 *   especie VARCHAR(50) NOT NULL,
 *   sexo VARCHAR(20),
 *   edad_minima INT,
 *   edad_maxima INT,
 *   peso_minimo DECIMAL(8,2),
 *   peso_maximo DECIMAL(8,2),
 *   valor_minimo DECIMAL(12,4) NOT NULL,
 *   valor_maximo DECIMAL(12,4) NOT NULL,
 *   alerta_minima DECIMAL(12,4),
 *   alerta_maxima DECIMAL(12,4),
 *   observaciones TEXT,
 *   estado ENUM('activo', 'inactivo') DEFAULT 'activo',
 *   creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   FOREIGN KEY (id_prueba) REFERENCES pruebas(id) ON DELETE CASCADE,
 *   INDEX idx_prueba (id_prueba),
 *   INDEX idx_especie (especie),
 *   INDEX idx_edad (edad_minima, edad_maxima),
 *   UNIQUE KEY uq_ref (id_prueba, especie, sexo, edad_minima, edad_maxima, peso_minimo, peso_maximo)
 * );
 */
export class ValorReferenciaEntity {
  id: number
  idPrueba: number
  especie: string
  sexo?: string
  edadMinima?: number
  edadMaxima?: number
  pesoMinimo?: number
  pesoMaximo?: number
  valorMinimo: number
  valorMaximo: number
  alertaMinima?: number
  alertaMaxima?: number
  observaciones?: string
  estado: 'activo' | 'inactivo'
  creado: Date
  actualizado: Date
  prueba?: PruebaEntity
}

// ============================================================================
// 2. DTOs (Data Transfer Objects)
// ============================================================================

export class CreateEstudioDto {
  codigo: string
  nombre: string
  categoria: string
  descripcion?: string
  costo: number
  tiempoResultado: number
  estado: 'activo' | 'inactivo' = 'activo'
}

export class UpdateEstudioDto {
  codigo?: string
  nombre?: string
  categoria?: string
  descripcion?: string
  costo?: number
  tiempoResultado?: number
  estado?: 'activo' | 'inactivo'
}

export class CreatePruebaDto {
  idEstudio: number
  codigo: string
  nombre: string
  unidadMedida: string
  decimalesPermitidos?: number = 2
  metodoMedicion?: string
  notas?: string
  estado?: 'activo' | 'inactivo' = 'activo'
}

export class CreateValorReferenciaDto {
  idPrueba: number
  especie: string
  sexo?: string
  edadMinima?: number
  edadMaxima?: number
  pesoMinimo?: number
  pesoMaximo?: number
  valorMinimo: number
  valorMaximo: number
  alertaMinima?: number
  alertaMaxima?: number
  observaciones?: string
  estado?: 'activo' | 'inactivo' = 'activo'
}

// ============================================================================
// 3. SERVICIOS
// ============================================================================

/**
 * EstudiosService
 */
export class EstudiosService {
  async obtenerEstudios(page: number, limit: number) {
    // SELECT * FROM estudios LIMIT :limit OFFSET :offset
    // SELECT COUNT(*) FROM estudios
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    }
  }

  async crearEstudio(dto: CreateEstudioDto) {
    // INSERT INTO estudios (codigo, nombre, categoria, ...) VALUES (...)
    return {}
  }

  async actualizarEstudio(id: number, dto: UpdateEstudioDto) {
    // UPDATE estudios SET ... WHERE id = :id
    return {}
  }

  async eliminarEstudio(id: number) {
    // DELETE FROM estudios WHERE id = :id
  }

  async obtenerActivos() {
    // SELECT * FROM estudios WHERE estado = 'activo'
    return []
  }

  async importarCSV(file: Buffer) {
    // Parsear CSV y hacer bulk insert
    // Validar códigos únicos
    return { importados: 0, errores: [] }
  }

  async exportarCSV() {
    // Generar CSV con todos los estudios
    return Buffer.from('...')
  }
}

/**
 * ValoresReferenciaService - EL MÁS IMPORTANTE
 */
export class ValoresReferenciaService {
  async obtenerValores(filters: any) {
    // SELECT * FROM valores_referencia WHERE especie = ? AND ... LIMIT ... OFFSET ...
    return {
      data: [],
      total: 0
    }
  }

  async obtenerValorAplicable(
    idPrueba: number,
    especie: string,
    edad?: number,
    peso?: number,
    sexo?: string
  ) {
    // SELECT * FROM valores_referencia WHERE
    //   id_prueba = ? AND
    //   especie = ? AND
    //   (sexo IS NULL OR sexo = ?) AND
    //   (edad IS NULL OR edad >= edad_minima) AND
    //   (edad IS NULL OR edad <= edad_maxima) AND
    //   (peso IS NULL OR peso >= peso_minimo) AND
    //   (peso IS NULL OR peso <= peso_maximo)
    // LIMIT 1
    return null
  }

  async validarResultado(
    idPrueba: number,
    valor: number,
    especie: string,
    edad?: number,
    peso?: number,
    sexo?: string
  ) {
    // 1. Obtener valor de referencia aplicable
    const ref = await this.obtenerValorAplicable(idPrueba, especie, edad, peso, sexo)

    // 2. Comparar
    // normal: valor >= ref.valor_minimo AND valor <= ref.valor_maximo
    // alerta: (valor >= ref.alerta_minima) OR (valor <= ref.alerta_minima_baja)
    // critico: valor < alerta

    return {
      esValido: true,
      estado: 'normal', // 'normal' | 'alerta_baja' | 'alerta_alta' | 'critico_bajo' | 'critico_alto'
      mensaje: 'Resultado dentro de rango normal',
      rango: { minimo: 12, maximo: 18 }
    }
  }

  async importarCSV(file: Buffer) {
    // Parsear CSV con estructura:
    // id_prueba, especie, sexo, edad_minima, edad_maxima, peso_minima, peso_maxima, valor_minimo, valor_maximo, alerta_minima, alerta_maxima
    return { importados: 0, errores: [] }
  }
}

// ============================================================================
// 4. CONTROLADORES
// ============================================================================

/**
 * EstudiosController
 *
 * GET /api/laboratorio/estudios
 * GET /api/laboratorio/estudios/:id
 * POST /api/laboratorio/estudios
 * PUT /api/laboratorio/estudios/:id
 * DELETE /api/laboratorio/estudios/:id
 * POST /api/laboratorio/estudios/import
 * GET /api/laboratorio/estudios/export
 */

/**
 * PruebasController
 *
 * GET /api/laboratorio/pruebas
 * GET /api/laboratorio/pruebas/estudio/:idEstudio
 * POST /api/laboratorio/pruebas
 * PUT /api/laboratorio/pruebas/:id
 * DELETE /api/laboratorio/pruebas/:id
 */

/**
 * ValoresReferenciaController - IMPORTANTE
 *
 * GET /api/laboratorio/valores-referencia
 * POST /api/laboratorio/valores-referencia
 * PUT /api/laboratorio/valores-referencia/:id
 * DELETE /api/laboratorio/valores-referencia/:id
 *
 * POST /api/laboratorio/valores-referencia/validar
 *   Body: { idPrueba, valor, especie, edad?, peso?, sexo? }
 *   Response: { esValido, estado, mensaje, rango }
 *
 * GET /api/laboratorio/valores-referencia/prueba/:idPrueba/especie/:especie
 * GET /api/laboratorio/valores-referencia/buscar?idPrueba=X&especie=Y&edad=Z&peso=W
 *
 * POST /api/laboratorio/valores-referencia/import
 * GET /api/laboratorio/valores-referencia/export
 */

/**
 * TiposMuestraController
 *
 * GET /api/laboratorio/tipos-muestra
 * POST /api/laboratorio/tipos-muestra
 * PUT /api/laboratorio/tipos-muestra/:id
 * DELETE /api/laboratorio/tipos-muestra/:id
 */

// ============================================================================
// 5. EJEMPLO: Endpoint de validación de resultado
// ============================================================================

/**
 * Cuando el laboratorio ingresa un resultado, el sistema debe validar:
 *
 * POST /api/laboratorio/resultados/validar
 * {
 *   idPrueba: 5,
 *   valor: 13.5,
 *   unidadMedida: "g/dL",
 *   especie: "canino",
 *   edad: 3,
 *   peso: 15,
 *   sexo: "macho"
 * }
 *
 * Response:
 * {
 *   idPrueba: 5,
 *   nombre: "Hemoglobina",
 *   valor: 13.5,
 *   unidadMedida: "g/dL",
 *   rangoNormal: { minimo: 12, maximo: 18 },
 *   alerta: { minimo: 10, maximo: 20 },
 *   estado: "normal",  // normal | alerta | critico
 *   interpretacion: "Resultado dentro del rango normal para canino adulto",
 *   referencia: "Canino 3 años, 15 kg, macho"
 * }
 */

// ============================================================================
// 6. ESTRUCTURA CARPETAS RECOMENDADA
// ============================================================================

/**
 * src/
 * └── modules/
 *     └── laboratorio-catalogo/
 *         ├── entities/
 *         │   ├── tipo-muestra.entity.ts
 *         │   ├── estudio.entity.ts
 *         │   ├── prueba.entity.ts
 *         │   └── valor-referencia.entity.ts
 *         ├── dtos/
 *         │   ├── create-estudio.dto.ts
 *         │   ├── create-prueba.dto.ts
 *         │   ├── create-valor-referencia.dto.ts
 *         │   ├── create-tipo-muestra.dto.ts
 *         │   └── validar-resultado.dto.ts
 *         ├── services/
 *         │   ├── estudios.service.ts
 *         │   ├── pruebas.service.ts
 *         │   ├── valores-referencia.service.ts (⭐ MÁS IMPORTANTE)
 *         │   └── tipos-muestra.service.ts
 *         ├── controllers/
 *         │   ├── estudios.controller.ts
 *         │   ├── pruebas.controller.ts
 *         │   ├── valores-referencia.controller.ts
 *         │   └── tipos-muestra.controller.ts
 *         └── laboratorio-catalogo.module.ts
 */

// ============================================================================
// 7. TODO: CHECKLIST DE IMPLEMENTACIÓN
// ============================================================================

/**
 * BACKEND (NestJS):
 *
 * [ ] Crear migrations para las 4 tablas
 * [ ] Crear entities (TypeORM)
 * [ ] Crear DTOs
 * [ ] Crear CrudService para cada entidad
 * [ ] Crear controllers con endpoints REST
 * [ ] Implementar validación de CSV para importación
 * [ ] Implementar endpoint de validación de resultados
 * [ ] Endpoint de búsqueda de valor de referencia más apropiado
 * [ ] Tests unitarios para ValoresReferenciaService
 * [ ] Documentación Swagger
 *
 * FRONTEND (ya hecho):
 * ✓ Tipos/Interfaces
 * ✓ Servicios
 * ✓ Componentes CRUD (AbmEstudios, AbmPruebas, AbmValoresReferencia, AbmTiposMuestra)
 * ✓ Importación/Exportación CSV en UI
 *
 * INTEGRACIÓN:
 * [ ] Conectar SelectorEstudios al servicio real (no hardcodeado)
 * [ ] Validar resultados en CargaResultados usando ValoresReferenciaService
 * [ ] Mostrar rangos normales al lado de cada resultado ingresado
 */

export default {}

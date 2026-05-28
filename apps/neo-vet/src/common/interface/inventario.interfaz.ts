// ============================================
// CATÁLOGOS Y CONFIGURACIÓN
// ============================================

export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    icono?: string;
    activo: boolean;
}

export interface TipoProducto {
    id: number;
    nombre: string;
    descripcion?: string;
    requiereFraccionamiento?: boolean;
    activo: boolean;
}

export interface UnidadMedida {
    id: number;
    nombre: string;
    abreviacion: string;
    tipo: 'masa' | 'volumen' | 'unidad';
    activo: boolean;
}

export interface Ubicacion {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

export interface Almacen {
    id: number;
    nombre: string;
    descripcion?: string;
    identificador?: string;
    activo: boolean;
}

// ============================================
// PRODUCTO (Catálogo General - Sin Almacén)
// ============================================

export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string;
    codigo?: string;
    codigoBarras?: string;

    // Relaciones (IDs)
    categoriaId?: number;
    tipoId?: number;
    unidadMedidaId?: number;
    id_fabricante?: number;
    id_proveedor?: number;

    // Relaciones (objetos poblados - opcional)
    categoria?: Categoria;
    tipo?: TipoProducto;
    unidadMedida?: UnidadMedida;
    fabricante?: any;
    proveedor?: Proveedor;

    // Pricing (general para todos los almacenes)
    costoUnitario: number;
    precioVenta: number;

    // Fraccionamiento (para medicamentos)
    manejoFraccionado?: boolean;
    contenidoPorEnvase?: number;
    unidadEnvase?: string;
    dosisPorAplicacion?: number;
    unidadDosis?: string;

    // Metadata
    fechaCreacion?: string;
    fechaModificacion?: string;
    activo: boolean;
}

// ============================================
// EXISTENCIA (Stock por Almacén)
// ============================================

export interface Existencia {
    id: number;
    productoId: number;
    almacenId: number;
    
    // Stock específico de este almacén
    stockActual: number;
    stockMinimo: number;
    
    // Ubicación física dentro del almacén
    ubicacionId?: number;
    ubicacion?: Ubicacion;
    
    // Información de lote (opcional, por almacén)
    lote?: string;
    fechaVencimiento?: string;
    
    // Relaciones pobladas
    producto?: Producto;
    almacen?: Almacen;
    
    // Metadata
    fechaCreacion?: string;
    fechaModificacion?: string;
    activo: boolean;
}

// ============================================
// PROVEEDOR
// ============================================

export interface Proveedor {
    id: number;
    nombre: string;
    razonSocial?: string;
    rfc?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    contacto?: string;
    notas?: string;
    activo: boolean;
}

// ============================================
// DTOs
// ============================================

export interface CrearProducto extends Omit<Producto, 'id' | 'categoria' | 'tipo' | 'unidadMedida' | 'fabricante' | 'proveedor' | 'fechaCreacion' | 'fechaModificacion'> { }

export interface ActualizarProducto extends Partial<CrearProducto> { }

export interface CrearExistencia extends Omit<Existencia, 'id' | 'producto' | 'almacen' | 'ubicacion' | 'fechaCreacion' | 'fechaModificacion'> { }

export interface ActualizarExistencia extends Partial<CrearExistencia> { }

// ============================================
// MOVIMIENTOS (Opcional - para historial)
// ============================================

export interface MovimientoInventario {
    id: number;
    productoId: number;
    producto?: Producto;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'venta';
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    motivo?: string;
    usuario?: string;
    fecha: string;
}

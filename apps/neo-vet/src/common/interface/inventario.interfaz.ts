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

// ============================================
// PRODUCTO
// ============================================

export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string;

    // Relaciones (IDs)
    categoriaId?: number;
    tipoId?: number;
    ubicacionId?: number;

    // Relaciones (objetos poblados - opcional)
    categoria?: Categoria;
    tipo?: TipoProducto;
    ubicacion?: Ubicacion;

    // Stock
    stockUnidades: number;
    stockMinimo: number;
    unidadMedida: string;

    // Pricing
    costoUnitario: number;
    precioVenta: number;

    // Tracking
    lote?: string;
    fechaVencimiento?: string;
    proveedor?: string;

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
// DTOs
// ============================================

export interface CrearProducto extends Omit<Producto, 'id' | 'categoria' | 'tipo' | 'ubicacion' | 'fechaCreacion' | 'fechaModificacion'> { }

export interface ActualizarProducto extends Partial<CrearProducto> { }

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

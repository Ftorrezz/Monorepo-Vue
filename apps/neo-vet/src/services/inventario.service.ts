import { api } from 'boot/axios';

// ============================================
// INTERFACES
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

export interface Lote {
    id: number;
    productoId: number;
    producto?: Producto;
    proveedorId?: number;
    proveedor?: Proveedor;
    numeroLote: string;
    fechaVencimiento?: string;
    fechaIngreso: string;
    cantidad: number;
    cantidadDisponible: number;
    costoUnitario: number;
    ubicacionId?: number;
    ubicacion?: Ubicacion;
    activo: boolean;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string;
    codigo?: string;
    codigoBarras?: string;
    categoriaId?: number;
    tipoId?: number;
    categoria?: Categoria;
    tipo?: TipoProducto;
    unidadMedidaId?: number;
    unidadMedida?: UnidadMedida;
    stockMinimo: number;
    stockActual?: number;  // Calculado desde lotes
    precioVenta: number;
    manejoFraccionado?: boolean;
    contenidoPorEnvase?: number;
    unidadEnvase?: string;
    dosisPorAplicacion?: number;
    unidadDosis?: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
    activo: boolean;
    lotes?: Lote[];  // Relación con lotes
}

// ============================================
// SERVICIO CONSOLIDADO DE INVENTARIO
// ============================================

export default {
    // ==================== PRODUCTOS ====================
    productos: {
        getAll() {
            return api.get('/api/productos');
        },

        getTodos() {
            return api.get('/api/productos/todos');
        },

        getById(id: number) {
            return api.get(`/api/productos/${id}`);
        },

        create(producto: Partial<Producto>) {
            return api.post('/api/productos', producto);
        },

        update(id: number, producto: Partial<Producto>) {
            return api.put(`/api/productos/${id}`, producto);
        },

        delete(id: number) {
            return api.delete(`/api/productos/${id}`);
        },

        getByCategoria(categoriaId: number) {
            return api.get('/api/productos/categoria', {
                params: { categoriaId }
            });
        },

        getByTipo(tipoId: number) {
            return api.get('/api/productos/tipo', {
                params: { tipoId }
            });
        },

        getBajoStock() {
            return api.get('/api/productos/bajo-stock');
        },

        getProximosVencer(dias: number = 30) {
            return api.get('/api/productos/proximos-vencer', {
                params: { dias }
            });
        },

        search(query: string) {
            return api.get('/api/productos/search', {
                params: { q: query }
            });
        },

        ajustarStock(id: number, ajuste: {
            tipo: 'entrada' | 'salida' | 'ajuste_positivo' | 'ajuste_negativo';
            cantidad: number;
            motivo?: string;
        }) {
            return api.post(`/api/productos/${id}/ajustar-stock`, ajuste);
        }
    },

    // ==================== CATEGORÍAS ====================
    categorias: {
        getAll() {
            return api.get('/api/categorias');
        },

        getActive() {
            return api.get('/api/categorias/activas');
        },

        getById(id: number) {
            return api.get(`/api/categorias/${id}`);
        },

        create(categoria: Partial<Categoria>) {
            return api.post('/api/categorias', categoria);
        },

        update(id: number, categoria: Partial<Categoria>) {
            return api.put(`/api/categorias/${id}`, categoria);
        },

        delete(id: number) {
            return api.delete(`/api/categorias/${id}`);
        }
    },

    // ==================== TIPOS DE PRODUCTO ====================
    tipos: {
        getAll() {
            return api.get('/api/tipos-producto');
        },

        getActive() {
            return api.get('/api/tipos-producto/activos');
        },

        getById(id: number) {
            return api.get(`/api/tipos-producto/${id}`);
        },

        create(tipo: Partial<TipoProducto>) {
            return api.post('/api/tipos-producto', tipo);
        },

        update(id: number, tipo: Partial<TipoProducto>) {
            return api.put(`/api/tipos-producto/${id}`, tipo);
        },

        delete(id: number) {
            return api.delete(`/api/tipos-producto/${id}`);
        }
    },

    // ==================== UNIDADES DE MEDIDA ====================
    unidades: {
        getAll() {
            return api.get('/api/unidades-medida');
        },

        getActive() {
            return api.get('/api/unidades-medida/activas');
        },

        getByTipo(tipo: 'masa' | 'volumen' | 'unidad') {
            return api.get('/api/unidades-medida/tipo', {
                params: { tipo }
            });
        },

        getById(id: number) {
            return api.get(`/api/unidades-medida/${id}`);
        },

        create(unidad: Partial<UnidadMedida>) {
            return api.post('/api/unidades-medida', unidad);
        },

        update(id: number, unidad: Partial<UnidadMedida>) {
            return api.put(`/api/unidades-medida/${id}`, unidad);
        },

        delete(id: number) {
            return api.delete(`/api/unidades-medida/${id}`);
        }
    },

    // ==================== UBICACIONES ====================
    ubicaciones: {
        getAll() {
            return api.get('/api/ubicaciones/todas');
        },

        getActive() {
            return api.get('/api/ubicaciones');
        },

        getById(id: number) {
            return api.get(`/api/ubicaciones/${id}`);
        },

        create(ubicacion: Partial<Ubicacion>) {
            return api.post('/api/ubicaciones', ubicacion);
        },

        update(id: number, ubicacion: Partial<Ubicacion>) {
            return api.put(`/api/ubicaciones/${id}`, ubicacion);
        },

        delete(id: number) {
            return api.delete(`/api/ubicaciones/${id}`);
        },

        toggleStatus(id: number) {
            return api.patch(`/api/ubicaciones/${id}/toggle-status`);
        }
    },

    // ==================== PROVEEDORES ====================
    proveedores: {
        getAll() {
            return api.get('/api/proveedores');
        },

        getActive() {
            return api.get('/api/proveedores/activos');
        },

        getById(id: number) {
            return api.get(`/api/proveedores/${id}`);
        },

        create(proveedor: Partial<Proveedor>) {
            return api.post('/api/proveedores', proveedor);
        },

        update(id: number, proveedor: Partial<Proveedor>) {
            return api.put(`/api/proveedores/${id}`, proveedor);
        },

        delete(id: number) {
            return api.delete(`/api/proveedores/${id}`);
        },

        search(query: string) {
            return api.get('/api/proveedores/search', {
                params: { q: query }
            });
        }
    },

    // ==================== LOTES ====================
    lotes: {
        getAll() {
            return api.get('/api/lotes');
        },

        getByProducto(productoId: number) {
            return api.get(`/api/productos/${productoId}/lotes`);
        },

        getById(id: number) {
            return api.get(`/api/lotes/${id}`);
        },

        create(lote: Partial<Lote>) {
            return api.post('/api/lotes', lote);
        },

        update(id: number, lote: Partial<Lote>) {
            return api.put(`/api/lotes/${id}`, lote);
        },

        delete(id: number) {
            return api.delete(`/api/lotes/${id}`);
        },

        // Obtener lotes próximos a vencer
        getProximosVencer(dias: number = 30) {
            return api.get('/api/lotes/proximos-vencer', {
                params: { dias }
            });
        },

        // Obtener lotes con bajo stock
        getBajoStock() {
            return api.get('/api/lotes/bajo-stock');
        },

        // Ajustar cantidad de un lote específico
        ajustarCantidad(id: number, ajuste: {
            tipo: 'entrada' | 'salida' | 'ajuste';
            cantidad: number;
            motivo?: string;
        }) {
            return api.post(`/api/lotes/${id}/ajustar`, ajuste);
        }
    }
};

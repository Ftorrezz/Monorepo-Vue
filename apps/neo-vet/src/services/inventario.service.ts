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
            return api.get('/inventario/productos');
        },

        getTodos() {
            return api.get('/productos/todos');
        },

        getById(id: number) {
            return api.get(`/productos/${id}`);
        },

        create(producto: Partial<Producto>) {
            return api.post('/productos', producto);
        },

        update(id: number, producto: Partial<Producto>) {
            return api.put(`/productos/${id}`, producto);
        },

        delete(id: number) {
            return api.delete(`/productos/${id}`);
        },

        getByCategoria(categoriaId: number) {
            return api.get('/inventario/productos/categoria/' + categoriaId);
        },

        getByTipo(tipoId: number) {
            return api.get('/productos/tipo', {
                params: { tipoId }
            });
        },

        getBajoStock() {
            return api.get('/inventario/lotes/bajo-stock');
        },

        getProximosVencer(dias: number = 30) {
            return api.get('/productos/proximos-vencer', {
                params: { dias }
            });
        },

        search(query: string) {
            return api.get('/productos/search', {
                params: { q: query }
            });
        },

        ajustarStock(id: number, ajuste: {
            tipo: 'entrada' | 'salida' | 'ajuste_positivo' | 'ajuste_negativo';
            cantidad: number;
            motivo?: string;
        }) {
            return api.post(`/productos/${id}/ajustar-stock`, ajuste);
        },

        deducirInventario(payload: { id_presentacion: number, cantidad: number, origen: string, referencia_id: string }) {
            return api.post('/inventario/deducir', payload);
        }
    },

    // ==================== CATEGORÍAS ====================
    categorias: {
        getAll() {
            // MOCK para evitar 404 ya que no hay controlador
            return Promise.resolve({ data: [{ id: 1, nombre: 'Medicamentos' }, { id: 2, nombre: 'Accesorios' }] });
        },

        getActive() {
            return api.get('/categorias/activas');
        },

        getById(id: number) {
            return api.get(`/categorias/${id}`);
        },

        create(categoria: Partial<Categoria>) {
            return api.post('/categorias', categoria);
        },

        update(id: number, categoria: Partial<Categoria>) {
            return api.put(`/categorias/${id}`, categoria);
        },

        delete(id: number) {
            return api.delete(`/categorias/${id}`);
        }
    },

    // ==================== TIPOS DE PRODUCTO ====================
    tipos: {
        getAll() {
            return Promise.resolve({ data: [{ id: 1, nombre: 'Físico' }, { id: 2, nombre: 'Servicio' }] });
        },

        getActive() {
            return api.get('/tipos-producto/activos');
        },

        getById(id: number) {
            return api.get(`/tipos-producto/${id}`);
        },

        create(tipo: Partial<TipoProducto>) {
            return api.post('/tipos-producto', tipo);
        },

        update(id: number, tipo: Partial<TipoProducto>) {
            return api.put(`/tipos-producto/${id}`, tipo);
        },

        delete(id: number) {
            return api.delete(`/tipos-producto/${id}`);
        }
    },

    // ==================== UNIDADES DE MEDIDA ====================
    unidades: {
        getAll() {
            return Promise.resolve({ data: [{ id: 1, abreviacion: 'ml', nombre: 'Mililitros', tipo: 'volumen' }, { id: 2, abreviacion: 'cja', nombre: 'Caja', tipo: 'unidad' }] });
        },

        getActive() {
            return api.get('/unidades-medida/activas');
        },

        getByTipo(tipo: 'masa' | 'volumen' | 'unidad') {
            return api.get('/unidades-medida/tipo', {
                params: { tipo }
            });
        },

        getById(id: number) {
            return api.get(`/unidades-medida/${id}`);
        },

        create(unidad: Partial<UnidadMedida>) {
            return api.post('/unidades-medida', unidad);
        },

        update(id: number, unidad: Partial<UnidadMedida>) {
            return api.put(`/unidades-medida/${id}`, unidad);
        },

        delete(id: number) {
            return api.delete(`/unidades-medida/${id}`);
        }
    },

    // ==================== UBICACIONES ====================
    ubicaciones: {
        getAll() {
            return Promise.resolve({ data: [{ id: 1, nombre: 'Farmacia Central' }] });
        },

        getActive() {
            return Promise.resolve({ data: [{ id: 1, nombre: 'Farmacia Central' }] });
        },

        getById(id: number) {
            return api.get(`/ubicaciones/${id}`);
        },

        create(ubicacion: Partial<Ubicacion>) {
            return api.post('/ubicaciones', ubicacion);
        },

        update(id: number, ubicacion: Partial<Ubicacion>) {
            return api.put(`/ubicaciones/${id}`, ubicacion);
        },

        delete(id: number) {
            return api.delete(`/ubicaciones/${id}`);
        },

        toggleStatus(id: number) {
            return api.patch(`/ubicaciones/${id}/toggle-status`);
        }
    },

    // ==================== PROVEEDORES ====================
    proveedores: {
        getAll() {
            return Promise.resolve({ data: [{ id: 1, nombre: 'Proveedor A' }, { id: 2, nombre: 'Proveedor B' }] });
        },

        getActive() {
            return api.get('/proveedores/activos');
        },

        getById(id: number) {
            return api.get(`/proveedores/${id}`);
        },

        create(proveedor: Partial<Proveedor>) {
            return api.post('/proveedores', proveedor);
        },

        update(id: number, proveedor: Partial<Proveedor>) {
            return api.put(`/proveedores/${id}`, proveedor);
        },

        delete(id: number) {
            return api.delete(`/proveedores/${id}`);
        },

        search(query: string) {
            return api.get('/proveedores/search', {
                params: { q: query }
            });
        }
    },

    // ==================== LOTES ====================
    lotes: {
        getAll() {
            return api.get('/lotes');
        },

        getByProducto(productoId: number) {
            return api.get(`/productos/${productoId}/lotes`);
        },

        getById(id: number) {
            return api.get(`/lotes/${id}`);
        },

        create(lote: Partial<Lote>) {
            return api.post('/lotes', lote);
        },

        update(id: number, lote: Partial<Lote>) {
            return api.put(`/lotes/${id}`, lote);
        },

        delete(id: number) {
            return api.delete(`/lotes/${id}`);
        },

        // Obtener lotes próximos a vencer
        getProximosVencer(dias: number = 30) {
            return api.get('/lotes/proximos-vencer', {
                params: { dias }
            });
        },

        // Obtener lotes con bajo stock
        getBajoStock() {
            return api.get('/lotes/bajo-stock');
        },

        // Ajustar cantidad de un lote específico
        ajustarCantidad(id: number, ajuste: {
            tipo: 'entrada' | 'salida' | 'ajuste';
            cantidad: number;
            motivo?: string;
        }) {
            return api.post(`/lotes/${id}/ajustar`, ajuste);
        }
    },

    // ==================== REPORTES ====================
    reportes: {
        descargarPdf(tipo: string) {
            return api.get(`/inventario/reporte/${tipo}`, { responseType: 'blob' });
        }
    }
};

import { api } from 'boot/axios';
import PeticionService from 'src/services/peticion.service';

const peticionService = new PeticionService();

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

// Helper to extract data from PeticionService response
const mapPeticionResponse = (response: any) => {
    if (Array.isArray(response) && response[0]?.elemento) {
        return { data: Array.isArray(response[0].elemento) ? response[0].elemento : [] };
    }
    return { data: Array.isArray(response) ? response : (response?.data || []) };
};

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
        async getAll() {
            // Modulo 2 (Inventario), Tabla 18 (Categoria Producto)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: 2, id_tabla: 18 }
            });
            return mapPeticionResponse(response);
        },

        async getActive() {
            // Filter locally if endpoint doesn't support it, or use a specific endpoint if exists
            const { data } = await this.getAll();
            return { data: data.filter((c: any) => c.activo === 'S' || c.activo === true) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`configuracionparametros/${id}`);
        },

        create(categoria: Partial<Categoria>) {
            return peticionService.crear('configuracionparametros', {
                ...categoria,
                id_modulo: 2,
                id_tabla: 18,
                id_configuracion: 1
            });
        },

        update(id: number, categoria: Partial<Categoria>) {
            return peticionService.actualizar(`configuracionparametros/${id}`, categoria);
        },

        delete(id: number) {
            return peticionService.eliminar('configuracionparametros', { id });
        }
    },

    // ==================== TIPOS DE PRODUCTO ====================
    tipos: {
        async getAll() {
            // Modulo 2 (Inventario), Tabla 19 (Tipo Producto)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: 2, id_tabla: 19 }
            });
            return mapPeticionResponse(response);
        },

        async getActive() {
            const { data } = await this.getAll();
            return { data: data.filter((t: any) => t.activo === 'S' || t.activo === true) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`configuracionparametros/${id}`);
        },

        create(tipo: Partial<TipoProducto>) {
            return peticionService.crear('configuracionparametros', {
                ...tipo,
                id_modulo: 2,
                id_tabla: 19,
                id_configuracion: 1
            });
        },

        update(id: number, tipo: Partial<TipoProducto>) {
            return peticionService.actualizar(`configuracionparametros/${id}`, tipo);
        },

        delete(id: number) {
            return peticionService.eliminar('configuracionparametros', { id });
        }
    },

    // ==================== UNIDADES DE MEDIDA ====================
    unidades: {
        async getAll() {
            // Modulo 2 (Inventario), Tabla 20 (Unidad Medida)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: 2, id_tabla: 20 }
            });
            return mapPeticionResponse(response);
        },

        async getActive() {
            const { data } = await this.getAll();
            return { data: data.filter((u: any) => u.activo === 'S' || u.activo === true) };
        },

        async getByTipo(tipo: 'masa' | 'volumen' | 'unidad') {
            const { data } = await this.getAll();
            return { data: data.filter((u: any) => u.tipo === tipo) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`configuracionparametros/${id}`);
        },

        create(unidad: Partial<UnidadMedida>) {
            return peticionService.crear('configuracionparametros', {
                ...unidad,
                id_modulo: 2,
                id_tabla: 20,
                id_configuracion: 1
            });
        },

        update(id: number, unidad: Partial<UnidadMedida>) {
            return peticionService.actualizar(`configuracionparametros/${id}`, unidad);
        },

        delete(id: number) {
            return peticionService.eliminar('configuracionparametros', { id });
        }
    },

    // ==================== UBICACIONES ====================
    ubicaciones: {
        async getAll() {
            // Modulo 2 (Inventario), Tabla 22 (Ubicacion)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: 2, id_tabla: 22 }
            });
            return mapPeticionResponse(response);
        },

        async getActive() {
            const { data } = await this.getAll();
            return { data: data.filter((u: any) => u.activo === 'S' || u.activo === true) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`configuracionparametros/${id}`);
        },

        create(ubicacion: Partial<Ubicacion>) {
            return peticionService.crear('configuracionparametros', {
                ...ubicacion,
                id_modulo: 2,
                id_tabla: 22,
                id_configuracion: 1
            });
        },

        update(id: number, ubicacion: Partial<Ubicacion>) {
            return peticionService.actualizar(`configuracionparametros/${id}`, ubicacion);
        },

        delete(id: number) {
            return peticionService.eliminar('configuracionparametros', { id });
        },

        toggleStatus(id: number) {
            return peticionService.actualizar(`configuracionparametros/toggle/${id}`, {});
        }
    },

    formasFarmaceuticas: {
        async getAll() {
            // Modulo 2 (Inventario), Tabla 21 (Forma Farmaceutica)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: 2, id_tabla: 21 }
            });
            return mapPeticionResponse(response);
        },

        async getActive() {
            const { data } = await this.getAll();
            return { data: data.filter((f: any) => f.activo === 'S' || f.activo === true) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`configuracionparametros/${id}`);
        },

        create(forma: any) {
            return peticionService.crear('configuracionparametros', {
                ...forma,
                id_modulo: 2,
                id_tabla: 21,
                id_configuracion: 1
            });
        },

        update(id: number, forma: any) {
            return peticionService.actualizar(`configuracionparametros/${id}`, forma);
        },

        delete(id: number) {
            return peticionService.eliminar('configuracionparametros', { id });
        }
    },

    // ==================== PROVEEDORES ====================
    proveedores: {
        async getAll() {
            const response = await peticionService.obtenerGet('proveedor');
            return mapPeticionResponse(response);
        },

        async getActive() {
            const { data } = await this.getAll();
            return { data: data.filter((p: any) => p.activo === 'S' || p.activo === true) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`proveedor/${id}`);
        },

        create(proveedor: Partial<Proveedor>) {
            return peticionService.crear('proveedor', proveedor);
        },

        update(id: number, proveedor: Partial<Proveedor>) {
            return peticionService.actualizar(`proveedor/${id}`, proveedor);
        },

        delete(id: number) {
            return peticionService.eliminar('proveedor', { id });
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

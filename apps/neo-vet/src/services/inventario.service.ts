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
    id_categoria?: number;
    id_tipo?: number;
    id_unidad_medida?: number;
    id_fabricante?: number;
    id_proveedor?: number;
    categoria?: Categoria;
    tipo?: TipoProducto;
    fabricante?: any;
    proveedor?: Proveedor;
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
        async getAll() {
            const response = await peticionService.obtenerGet('inventario/productos');
            return mapPeticionResponse(response);
        },

        async getTodos() {
            const response = await peticionService.obtenerGet('inventario/productos');
            return mapPeticionResponse(response);
        },

        async getById(id: number) {
            const response = await peticionService.obtenerGet(`inventario/productos/${id}`);
            return mapPeticionResponse(response);
        },

        async create(producto: Partial<Producto>) {
            return peticionService.crear('inventario/productos', producto);
        },

        async update(id: number, producto: Partial<Producto>) {
            return peticionService.actualizar(`inventario/productos/${id}`, producto);
        },

        async delete(id: number) {
            return peticionService.eliminar('inventario/productos', { id });
        },

        async getByCategoria(categoriaId: number) {
            const response = await peticionService.obtenerGet(`inventario/productos/categoria/${categoriaId}`);
            return mapPeticionResponse(response);
        },

        async getBajoStock() {
            const response = await peticionService.obtenerGet('inventario/lotes/bajo-stock');
            return mapPeticionResponse(response);
        },

        async deducirInventario(payload: { id_presentacion: number, cantidad: number, origen: string, referencia_id: string }) {
            return peticionService.crear('inventario/deducir', payload);
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

    // ==================== FORMAS FARMACÉUTICAS ====================
    formasFarmaceuticas: {
        async getAll() {
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

        async search(query: string) {
            const response = await peticionService.obtenerGet('inventario/productos/search', {
                filtro: { q: query }
            });
            return mapPeticionResponse(response);
        }
    },

    // ==================== FABRICANTES ====================
    fabricantes: {
        async getAll() {
            const response = await peticionService.obtenerGet('fabricante');
            return mapPeticionResponse(response);
        },

        async getActive() {
            const { data } = await this.getAll();
            return { data: data.filter((f: any) => f.activo === 'S' || f.activo === true) };
        },

        getById(id: number) {
            return peticionService.obtenerGet(`fabricante/${id}`);
        },

        create(fabricante: any) {
            return peticionService.crear('fabricante', fabricante);
        },

        update(id: number, fabricante: any) {
            return peticionService.actualizar(`fabricante/${id}`, fabricante);
        },

        delete(id: number) {
            return peticionService.eliminar('fabricante', { id });
        }
    },

    // ==================== LOTES ====================
    lotes: {
        async getAll() {
            const response = await peticionService.obtenerGet('inventario/lotes');
            return mapPeticionResponse(response);
        },

        async getByProducto(productoId: number) {
            const response = await peticionService.obtenerGet(`inventario/productos/${productoId}/lotes`);
            return mapPeticionResponse(response);
        },

        async getById(id: number) {
            const response = await peticionService.obtenerGet(`inventario/lotes/${id}`);
            return mapPeticionResponse(response);
        },

        async create(lote: Partial<Lote>) {
            return peticionService.crear('inventario/lotes', lote);
        },

        async update(id: number, lote: Partial<Lote>) {
            return peticionService.actualizar(`inventario/lotes/${id}`, lote);
        },

        async delete(id: number) {
            return peticionService.eliminar('inventario/lotes', { id });
        },

        async getBajoStock() {
            const response = await peticionService.obtenerGet('inventario/lotes/bajo-stock');
            return mapPeticionResponse(response);
        }
    },

    // ==================== REPORTES ====================
    reportes: {
        descargarPdf(tipo: string) {
            return peticionService.obtenerGet(`inventario/reporte/${tipo}`);
        }
    }
};

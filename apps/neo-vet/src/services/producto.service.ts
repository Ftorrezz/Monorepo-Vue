import { api } from '@/boot/axios';
import { Producto } from '../common/interface/inventario.interfaz';

/**
 * Servicio para gestionar productos del inventario
 * Conecta con el backend NestJS en /api/productos
 */
export const ProductoService = {
    /**
     * Obtener todos los productos activos
     */
    async getAll(): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>('/api/productos');
        return data;
    },

    /**
     * Obtener todos los productos (incluye inactivos)
     * Para administración
     */
    async getTodos(): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>('/api/productos/todos');
        return data;
    },

    /**
     * Obtener un producto por ID
     */
    async getById(id: number): Promise<Producto> {
        const { data } = await api.get<Producto>(`/api/productos/${id}`);
        return data;
    },

    /**
     * Crear un nuevo producto
     */
    async create(producto: Omit<Producto, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Promise<Producto> {
        const { data } = await api.post<Producto>('/api/productos', producto);
        return data;
    },

    /**
     * Actualizar un producto existente
     */
    async update(id: number, producto: Partial<Producto>): Promise<Producto> {
        const { data } = await api.put<Producto>(`/api/productos/${id}`, producto);
        return data;
    },

    /**
     * Eliminar (desactivar) un producto
     * Soft delete - solo cambia el estado a inactivo
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/api/productos/${id}`);
    },

    /**
     * Obtener productos por categoría
     */
    async getByCategoria(categoria: string): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>(`/api/productos/categoria/${categoria}`);
        return data;
    },

    /**
     * Obtener productos por tipo
     */
    async getByTipo(tipo: string): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>(`/api/productos/tipo/${tipo}`);
        return data;
    },

    /**
     * Obtener productos con stock bajo (menor o igual al stock mínimo)
     */
    async getBajoStock(): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>('/api/productos/bajo-stock');
        return data;
    },

    /**
     * Obtener productos próximos a vencer
     * @param dias Número de días de anticipación (default: 30)
     */
    async getProximosVencer(dias: number = 30): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>('/api/productos/proximos-vencer', {
            params: { dias }
        });
        return data;
    },

    /**
     * Buscar productos por nombre, descripción, lote o proveedor
     */
    async search(query: string): Promise<Producto[]> {
        const { data } = await api.get<Producto[]>('/api/productos/search', {
            params: { q: query }
        });
        return data;
    },

    /**
     * Ajustar stock de un producto
     */
    async ajustarStock(id: number, ajuste: {
        tipo: 'entrada' | 'salida' | 'ajuste_positivo' | 'ajuste_negativo';
        cantidad: number;
        motivo?: string;
    }): Promise<Producto> {
        const { data } = await api.post<Producto>(`/api/productos/${id}/ajustar-stock`, ajuste);
        return data;
    }
};

export default ProductoService;

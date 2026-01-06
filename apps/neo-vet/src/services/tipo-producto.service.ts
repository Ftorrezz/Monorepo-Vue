import { api } from '@/boot/axios';

export interface TipoProducto {
    id: number;
    nombre: string;
    descripcion?: string;
    requiereFraccionamiento?: boolean;
    activo: boolean;
}

/**
 * Servicio para gestionar tipos de productos
 * Conecta con el backend NestJS en /api/tipos-producto
 */
export const TipoProductoService = {
    /**
     * Obtener todos los tipos de producto
     */
    async getAll(): Promise<TipoProducto[]> {
        const { data } = await api.get<TipoProducto[]>('/api/tipos-producto');
        return data;
    },

    /**
     * Obtener solo tipos activos
     */
    async getActive(): Promise<TipoProducto[]> {
        const { data } = await api.get<TipoProducto[]>('/api/tipos-producto/activos');
        return data;
    },

    /**
     * Obtener un tipo por ID
     */
    async getById(id: number): Promise<TipoProducto> {
        const { data } = await api.get<TipoProducto>(`/api/tipos-producto/${id}`);
        return data;
    },

    /**
     * Crear un nuevo tipo de producto
     */
    async create(tipo: Omit<TipoProducto, 'id'>): Promise<TipoProducto> {
        const { data } = await api.post<TipoProducto>('/api/tipos-producto', tipo);
        return data;
    },

    /**
     * Actualizar un tipo existente
     */
    async update(id: number, tipo: Partial<TipoProducto>): Promise<TipoProducto> {
        const { data } = await api.put<TipoProducto>(`/api/tipos-producto/${id}`, tipo);
        return data;
    },

    /**
     * Eliminar (desactivar) un tipo de producto
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/api/tipos-producto/${id}`);
    }
};

export default TipoProductoService;

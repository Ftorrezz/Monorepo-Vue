import { api } from '@/boot/axios';

export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    icono?: string;
    activo: boolean;
}

/**
 * Servicio para gestionar categorías de productos
 * Conecta con el backend NestJS en /api/categorias
 */
export const CategoriaService = {
    /**
     * Obtener todas las categorías
     */
    async getAll(): Promise<Categoria[]> {
        const { data } = await api.get<Categoria[]>('/api/categorias');
        return data;
    },

    /**
     * Obtener solo categorías activas
     */
    async getActive(): Promise<Categoria[]> {
        const { data } = await api.get<Categoria[]>('/api/categorias/activas');
        return data;
    },

    /**
     * Obtener una categoría por ID
     */
    async getById(id: number): Promise<Categoria> {
        const { data } = await api.get<Categoria>(`/api/categorias/${id}`);
        return data;
    },

    /**
     * Crear una nueva categoría
     */
    async create(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
        const { data } = await api.post<Categoria>('/api/categorias', categoria);
        return data;
    },

    /**
     * Actualizar una categoría existente
     */
    async update(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
        const { data } = await api.put<Categoria>(`/api/categorias/${id}`, categoria);
        return data;
    },

    /**
     * Eliminar (desactivar) una categoría
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/api/categorias/${id}`);
    }
};

export default CategoriaService;

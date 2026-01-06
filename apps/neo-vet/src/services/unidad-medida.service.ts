import { api } from '@/boot/axios';

export interface UnidadMedida {
    id: number;
    nombre: string;
    abreviacion: string;
    tipo: 'masa' | 'volumen' | 'unidad';
    activo: boolean;
}

/**
 * Servicio para gestionar unidades de medida
 * Conecta con el backend NestJS en /api/unidades-medida
 */
export const UnidadMedidaService = {
    /**
     * Obtener todas las unidades de medida
     */
    async getAll(): Promise<UnidadMedida[]> {
        const { data } = await api.get<UnidadMedida[]>('/api/unidades-medida');
        return data;
    },

    /**
     * Obtener solo unidades activas
     */
    async getActive(): Promise<UnidadMedida[]> {
        const { data } = await api.get<UnidadMedida[]>('/api/unidades-medida/activas');
        return data;
    },

    /**
     * Obtener unidades por tipo (masa, volumen, unidad)
     */
    async getByTipo(tipo: 'masa' | 'volumen' | 'unidad'): Promise<UnidadMedida[]> {
        const { data } = await api.get<UnidadMedida[]>(`/api/unidades-medida/tipo/${tipo}`);
        return data;
    },

    /**
     * Obtener una unidad por ID
     */
    async getById(id: number): Promise<UnidadMedida> {
        const { data } = await api.get<UnidadMedida>(`/api/unidades-medida/${id}`);
        return data;
    },

    /**
     * Crear una nueva unidad de medida
     */
    async create(unidad: Omit<UnidadMedida, 'id'>): Promise<UnidadMedida> {
        const { data } = await api.post<UnidadMedida>('/api/unidades-medida', unidad);
        return data;
    },

    /**
     * Actualizar una unidad existente
     */
    async update(id: number, unidad: Partial<UnidadMedida>): Promise<UnidadMedida> {
        const { data } = await api.put<UnidadMedida>(`/api/unidades-medida/${id}`, unidad);
        return data;
    },

    /**
     * Eliminar (desactivar) una unidad de medida
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/api/unidades-medida/${id}`);
    }
};

export default UnidadMedidaService;

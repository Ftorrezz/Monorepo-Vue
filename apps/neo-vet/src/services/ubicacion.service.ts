import { api } from '@/boot/axios';
import { Ubicacion } from '../common/interface/inventario.interfaz';

/**
 * Servicio para gestionar ubicaciones de inventario
 * Conecta con el backend NestJS en /api/ubicaciones
 */
export const UbicacionService = {
    /**
     * Obtener todas las ubicaciones (activas e inactivas)
     * Para el módulo de administración
     */
    async getAll(): Promise<Ubicacion[]> {
        const { data } = await api.get<Ubicacion[]>('/api/ubicaciones/todas');
        return data;
    },

    /**
     * Obtener solo ubicaciones activas  
     * Para selectores y dropdowns
     */
    async getActive(): Promise<Ubicacion[]> {
        const { data } = await api.get<Ubicacion[]>('/api/ubicaciones');
        return data;
    },

    /**
     * Obtener una ubicación por ID
     */
    async getById(id: number): Promise<Ubicacion> {
        const { data } = await api.get<Ubicacion>(`/api/ubicaciones/${id}`);
        return data;
    },

    /**
     * Crear una nueva ubicación
     */
    async create(ubicacion: Omit<Ubicacion, 'id'>): Promise<Ubicacion> {
        const { data } = await api.post<Ubicacion>('/api/ubicaciones', ubicacion);
        return data;
    },

    /**
     * Actualizar una ubicación existente
     */
    async update(id: number, ubicacion: Partial<Ubicacion>): Promise<Ubicacion> {
        const { data } = await api.put<Ubicacion>(`/api/ubicaciones/${id}`, ubicacion);
        return data;
    },

    /**
     * Eliminar (desactivar) una ubicación
     * Soft delete - solo cambia el estado a inactivo
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/api/ubicaciones/${id}`);
    },

    /**
     * Activar/Desactivar una ubicación
     */
    async toggleStatus(id: number): Promise<Ubicacion> {
        const { data } = await api.patch<Ubicacion>(`/api/ubicaciones/${id}/toggle-status`);
        return data;
    }
};

export default UbicacionService;

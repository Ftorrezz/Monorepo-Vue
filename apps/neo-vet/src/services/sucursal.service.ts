import PeticionService from './peticion.service';
import Api from '../controles/api';
import { useDialogStore } from '../stores/DialogoUbicacion';

const peticionService = new PeticionService();

export interface Sucursal {
    id?: number;
    descripcion: string;
    abreviatura: string;
    responsable: string;
    direccion: string;
    id_sitio: number;
    activo: string;
    logo_url?: string;
    logo_public_id?: string;
    modulos?: any;
}

export const sucursalService = {
    async getSucursales() {
        return await peticionService.obtenerGet('sucursal');
    },

    async createSucursal(sucursal: Sucursal) {
        return await peticionService.crear('sucursal', sucursal);
    },

    async updateSucursal(id: number, sucursal: Sucursal) {
        return await peticionService.actualizar('sucursal', { ...sucursal, id });
    },

    async deleteSucursal(id: number) {
        return await peticionService.eliminar('sucursal', { id }, false);
    },

    async uploadLogo(id: number, file: File) {
        const store = useDialogStore();
        const formData = new FormData();
        formData.append('file', file);

        const headers = {
            'Content-Type': 'multipart/form-data',
            'idsitio': store.id_sitio,
            'idsucursal': store.id_sucursal
        };

        const response = await Api.post(`/sucursal/${id}/logo`, formData, { headers });
        return response.data;
    },

    async getModulos() {
        return await peticionService.obtenerGet('sucursal/modulos');
    },

    async getSitios() {
        return await peticionService.obtenerGet('sitio');
    }
};

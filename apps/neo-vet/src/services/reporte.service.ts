import PeticionService from './peticion.service';

const peticionService = new PeticionService();

export interface FiltroReporte {
    id: string;
    label: string;
    type: 'date' | 'text' | 'select' | 'daterange' | 'multiselect' | 'boolean' | 'number';
    required?: boolean;
    default?: any;
    options?: { label: string; value: any }[];
    opciones_endpoint?: string;
    value?: any; // Para uso en el frontend
}

export interface CatalogoReporte {
    IDENTIFICADOR: string;
    TITULO: string;
    DESCRIPCION: string;
    CATEGORIA: string;
    ICONO?: string;
    COLOR?: string;
    FILTROS: FiltroReporte[];
}

export const reporteService = {
    /**
     * Obtiene el catálogo de reportes configurados en el backend.
     */
    async getCatalogo(): Promise<CatalogoReporte[]> {
        const response = await peticionService.obtenerGet('reporte/catalogo');
        // Normalizar respuesta según el patrón del backend
        if (Array.isArray(response) && response[0]?.elemento) {
            return response[0].elemento;
        }
        return Array.isArray(response) ? response : (response?.data || []);
    },

    /**
     * Genera un reporte y devuelve el base64 del PDF.
     */
    async generar(identificador: string, filtros: Record<string, any>, formato: 'pdf' | 'excel' = 'pdf'): Promise<string> {
        const payload = {
            identificador,
            filtros,
            formato
        };
        const response = await peticionService.crear('reporte/generar', payload);
        
        // El backend devuelve { base64, formato, identificador }
        const data = response?.data || response;
        if (Array.isArray(data) && data[0]?.elemento) {
            return data[0].elemento.base64;
        }
        return data.base64;
    }
};

import configuracionParametrosService from "../services/configuracionParametros.service";

/**
 * Composable para la obtención y gestión de catálogos dinámicos
 * basados en el sistema de Configuración de Parámetros.
 */
export default function useCatalogos() {

    /**
     * Obtiene una lista de parámetros filtrada por módulo y tabla,
     * formateada para componentes q-select de Quasar.
     * 
     * @param {number} idModulo - ID del módulo (Enum Modulo)
     * @param {number} idTabla - ID de la tabla (Enum Tabla)
     * @returns {Promise<Array>} Lista de opciones { label, value }
     */
    const obtenerCatalogo = async (idModulo, idTabla) => {
        if (!idModulo || !idTabla) {
            console.warn('obtenerCatalogo: idModulo e idTabla son requeridos');
            return [];
        }

        try {
            const data = await configuracionParametrosService.getParametros(idModulo, idTabla);

            // Filtramos solo los activos
            const lista = Array.isArray(data) ? data : (data?.data || []);

            return lista
                .filter(p => p.activo === 'S' || p.activo === true)
                .map(p => ({
                    label: p.descripcion,
                    value: p.identificador || String(p.id),
                    id_original: p.id
                }));
        } catch (error) {
            console.error(`Error al cargar catálogo (Módulo: ${idModulo}, Tabla: ${idTabla}):`, error);
            return [];
        }
    };

    return {
        obtenerCatalogo
    };
}

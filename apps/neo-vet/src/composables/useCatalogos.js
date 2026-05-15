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
     * IMPORTANTE: el campo `value` es p.id (INTEGER) porque así se almacena
     * en la BD (ej. MASCOTA.ID_ESPECIE es FK a CONFIGURACIONPARAMETROS.ID).
     * Usar el string 'identificador' como value causaba mismatch al editar.
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
                    value: p.id,                // INTEGER: coincide con id_especie, id_raza, etc. guardados en BD
                    identificador: p.identificador  // string auxiliar disponible si se necesita
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

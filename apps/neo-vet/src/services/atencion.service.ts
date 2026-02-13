import NdPeticionControl from '../controles/rest.control';
import { DtoParametros } from '../controles/dto.parametros';

class AtencionService {
    constructor() { }

    // Obtener atenciones de una mascota
    async getAtencionesPorMascota(idMascota: number) {
        try {
            const peticion = new NdPeticionControl();
            if (!idMascota) return [];

            // Asumiendo endpoint GET atencion/mascota/:id
            // Si no existe, habrá que ajustar según backend real
            const response = await peticion.invocarMetodo(`atencion/mascota/${idMascota}`, 'get');
            return response?.data || response || [];
        } catch (error) {
            console.error('Error al obtener atenciones:', error);
            // Retornar array vacío para no romper la UI si falla
            return [];
        }
    }

    // Crear nueva atención
    async crearAtencion(datosAtencion: any) {
        try {
            const peticion = new NdPeticionControl();
            return await peticion.invocarMetodo('atencion', 'post', datosAtencion);
        } catch (error) {
            console.error('Error al crear atención:', error);
            throw error;
        }
    }

    // Actualizar estado o datos de atención
    async actualizarAtencion(idAtencion: number, datos: any) {
        try {
            const peticion = new NdPeticionControl();
            return await peticion.invocarMetodo(`atencion/${idAtencion}`, 'put', datos);
        } catch (error) {
            console.error('Error al actualizar atención:', error);
            throw error;
        }
    }

    // Agregar servicio a una atención
    async agregarServicio(datosServicio: any) {
        try {
            const peticion = new NdPeticionControl();
            // Endpoint para asociar servicio a atención
            return await peticion.invocarMetodo('atencion/servicio', 'post', datosServicio);
        } catch (error) {
            console.error('Error al agregar servicio:', error);
            throw error;
        }
    }

    // Obtener detalle de una atención (incluyendo servicios)
    async getDetalleAtencion(idAtencion: number) {
        try {
            const peticion = new NdPeticionControl();
            const response = await peticion.invocarMetodo(`atencion/${idAtencion}`, 'get');
            return response?.data || response;
        } catch (error) {
            console.error('Error al obtener detalle de atención:', error);
            return null;
        }
    }
}

export default new AtencionService();

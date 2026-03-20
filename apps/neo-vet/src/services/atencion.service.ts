import NdPeticionControl from '../controles/rest.control';
import { DtoParametros } from '../controles/dto.parametros';

class AtencionService {
    constructor() { }

    // Obtener atenciones de una mascota por id_paciente
    // Usa GET pacienteatencion (mismo patrón que citamotivo, profesional, etc.)
    async getAtencionesPorMascota(idMascota: number) {
        try {
            if (!idMascota) return [];
            const peticion = new NdPeticionControl();
            const response = await peticion.invocarMetodo('pacienteatencion', 'get');
            // El backend devuelve [{elemento: [...], mensajes: [], errores: []}]
            let lista: any[] = [];
            if (Array.isArray(response) && response[0]?.elemento) {
                lista = Array.isArray(response[0].elemento) ? response[0].elemento : [];
            } else {
                lista = Array.isArray(response) ? response : (response?.data || []);
            }
            // Filtrar por id_paciente en el frontend
            return lista.filter((a: any) => a.id_paciente === idMascota || a.paciente?.id === idMascota);
        } catch (error) {
            console.error('Error al obtener atenciones:', error);
            return [];
        }
    }

    // Crear nueva atención
    async crearAtencion(datosAtencion: any) {
        try {
            const peticion = new NdPeticionControl();
            return await peticion.invocarMetodo('pacienteatencion', 'post', datosAtencion);
        } catch (error) {
            console.error('Error al crear atención:', error);
            throw error;
        }
    }

    // Actualizar estado o datos de atención
    async actualizarAtencion(idAtencion: number, datos: any) {
        try {
            const peticion = new NdPeticionControl();
            return await peticion.invocarMetodo(`pacienteatencion/${idAtencion}`, 'put', datos);
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
            return await peticion.invocarMetodo('atencionservicios', 'post', datosServicio);
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

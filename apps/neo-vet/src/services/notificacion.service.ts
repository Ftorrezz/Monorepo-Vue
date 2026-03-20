import NdPeticionControl from 'src/controles/rest.control';

export interface Notificacion {
    id?: number;
    id_cita: number;
    id_propietario?: number;
    tipo: 'CONFIRMACION' | 'RECORDATORIO' | 'AVISO';
    medio: 'WSP' | 'MAIL' | 'SMS';
    destino: string;
    mensaje?: string;
    fecha_programada: string;
    fecha_envio?: string;
    estado: 'PEND' | 'SENT' | 'FAIL' | 'CANCEL';
    id_sucursal?: number;
    id_sitio?: number;
}

class NotificacionService {
    constructor() { }

    async queueNotificacion(notificacion: Notificacion) {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('notificacion', 'post', notificacion);
    }

    async getNotificacionesPendientes() {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('notificacion', 'get', null, {
            filtro: { estado: 'PEND' }
        });
    }

    async actualizarEstado(id: number, estado: string, errorLog?: string) {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('notificacion', 'put', { id, estado, error_log: errorLog });
    }
}

export default new NotificacionService();

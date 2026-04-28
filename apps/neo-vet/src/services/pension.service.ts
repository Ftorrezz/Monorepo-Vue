import { api } from 'boot/axios';
import PeticionService from 'src/services/peticion.service';
import { Modulo, Tabla } from 'src/common/enums/configuracion.enum';

const peticionService = new PeticionService();

// ============================================
// INTERFACES
// ============================================

export interface Pension {
    id?: number;
    id_mascota: number;
    id_propietario: number;
    id_jaula?: number;
    id_tipo_pension?: number;
    estado: 'RESERVADA' | 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
    fecha_entrada_estimada: string;
    fecha_salida_estimada?: string;
    fecha_entrada_real?: string;
    fecha_salida_real?: string;
    precio_dia: number;
    descuento?: number;
    precio_total?: number;
    instrucciones_especiales?: string;
    observaciones?: string;
    contacto_emergencia_nombre?: string;
    contacto_emergencia_telefono?: string;
    contacto_emergencia_relacion?: string;
    motivo_cancelacion?: string;
    // Relaciones cargadas del backend
    jaula?: PensionJaula;
    servicios?: PensionServicio[];
    eventos?: PensionEvento[];
    // Campos extra del frontend (no se envían al backend)
    mascota?: { nombre: string; especie: string; raza?: string };
    propietario?: { nombre: string; telefono?: string };
}

export interface PensionJaula {
    id?: number;
    nombre: string;
    numero?: string;
    id_tipo_jaula?: number;
    capacidad: number;
    descripcion?: string;
    estado: 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO';
    activo?: string;
    // Calculados en frontend
    tipo_label?: string;
    pensionActual?: Pension;
}

export interface PensionServicio {
    id?: number;
    id_pension: number;
    id_servicio_adicional: number;
    fecha: string;
    cantidad: number;
    precio_unitario: number;
    notas?: string;
    servicio_label?: string;
}

export interface PensionTurno {
    id?: number;
    id_jaula: number;
    personal_nombre: string;
    fecha: string;
    hora_inicio: string;
    hora_fin?: string;
    actividad: string;
    notas?: string;
    estado: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO';
    jaula?: PensionJaula;
}

export interface PensionEvento {
    id?: number;
    id_pension: number;
    tipo: 'CHECK_IN' | 'CHECK_OUT' | 'SERVICIO' | 'NOTA' | 'INCIDENCIA';
    descripcion: string;
    fecha: string;
    usuario_nombre?: string;
}

export interface EstadisticasPension {
    activas: number;
    reservadas: number;
    ingresosMes: number;
    totalJaulas: number;
    jaulasLibres: number;
    jaulasOcupadas: number;
}

// Helper para extraer respuesta del PeticionService
const mapPeticionResponse = (response: any) => {
    if (Array.isArray(response) && response[0]?.elemento) {
        return { data: Array.isArray(response[0].elemento) ? response[0].elemento : [] };
    }
    return { data: Array.isArray(response) ? response : (response?.data || []) };
};

// ============================================
// SERVICIO CONSOLIDADO DE PENSIÓN
// ============================================

export default {

    // ==================== PENSIONES ====================
    pensiones: {
        getAll() {
            return api.get('/pension');
        },

        getById(id: number) {
            return api.get(`/pension/${id}`);
        },

        getByEstado(estado: string) {
            return api.get(`/pension/estado/${estado}`);
        },

        create(pension: Partial<Pension>) {
            return api.post('/pension', pension);
        },

        update(id: number, pension: Partial<Pension>) {
            return api.put(`/pension/${id}`, pension);
        },

        delete(id: number) {
            return api.delete(`/pension/${id}`);
        },

        checkIn(id: number, payload: { fecha_real?: string; observaciones?: string; usuario_nombre?: string }) {
            return api.post(`/pension/${id}/checkin`, payload);
        },

        checkOut(id: number, payload: { fecha_real?: string; costo_adicional?: number; observaciones?: string; usuario_nombre?: string }) {
            return api.post(`/pension/${id}/checkout`, payload);
        },

        cancelar(id: number, motivo: string) {
            return api.post(`/pension/${id}/cancelar`, { motivo });
        },

        getEventos(id: number) {
            return api.get(`/pension/${id}/eventos`);
        },

        getEstadisticas() {
            return api.get('/pension/estadisticas');
        },
    },

    // ==================== JAULAS ====================
    jaulas: {
        getAll() {
            return api.get('/pension/jaulas/todas');
        },

        create(jaula: Partial<PensionJaula>) {
            return api.post('/pension/jaulas', jaula);
        },

        update(id: number, jaula: Partial<PensionJaula>) {
            return api.put(`/pension/jaulas/${id}`, jaula);
        },

        delete(id: number) {
            return api.delete(`/pension/jaulas/${id}`);
        },

        cambiarEstado(id: number, estado: string) {
            return api.put(`/pension/jaulas/${id}`, { estado });
        },
    },

    // ==================== TURNOS ====================
    turnos: {
        getByFecha(fecha?: string) {
            const fechaHoy = fecha || new Date().toISOString().split('T')[0];
            return api.get('/pension/turnos/fecha', { params: { fecha: fechaHoy } });
        },

        create(turno: Partial<PensionTurno>) {
            return api.post('/pension/turnos', turno);
        },

        update(id: number, turno: Partial<PensionTurno>) {
            return api.put(`/pension/turnos/${id}`, turno);
        },

        delete(id: number) {
            return api.delete(`/pension/turnos/${id}`);
        },
    },

    // ==================== SERVICIOS ADICIONALES ====================
    servicios: {
        add(servicio: Partial<PensionServicio>) {
            return api.post('/pension/servicios', servicio);
        },
    },

    // ==================== EVENTOS ====================
    eventos: {
        add(evento: Partial<PensionEvento>) {
            return api.post('/pension/eventos', evento);
        },
    },

    // ==================== CATÁLOGOS (via configuracionparametros) ====================
    catalogos: {
        async getTiposPension() {
            // Modulo 4 (Pension), Tabla 23 (Tipo Pension)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: Modulo.PENSION, id_tabla: Tabla.TIPO_PENSION }
            });
            return mapPeticionResponse(response);
        },

        async getTiposJaula() {
            // Modulo 4 (Pension), Tabla 24 (Tipo Jaula)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: Modulo.PENSION, id_tabla: Tabla.TIPO_JAULA }
            });
            return mapPeticionResponse(response);
        },

        async getServiciosAdicionales() {
            // Modulo 4 (Pension), Tabla 25 (Servicio Adicional Pension)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: Modulo.PENSION, id_tabla: Tabla.SERVICIO_ADICIONAL_PENSION }
            });
            return mapPeticionResponse(response);
        },

        async getMotivosCancelacion() {
            // Modulo 4 (Pension), Tabla 26 (Motivo Cancelacion)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: Modulo.PENSION, id_tabla: Tabla.MOTIVO_CANCELACION_PENSION }
            });
            return mapPeticionResponse(response);
        },

        async getActividadesTurno() {
            // Modulo 4 (Pension), Tabla 27 (Actividad Turno)
            const response = await peticionService.obtenerGet('configuracionparametros', {
                filtro: { id_modulo: Modulo.PENSION, id_tabla: Tabla.ACTIVIDAD_TURNO }
            });
            return mapPeticionResponse(response);
        },

        createParametro(tabla: Tabla, nombre: string, descripcion?: string) {
            return peticionService.crear('configuracionparametros', {
                nombre,
                descripcion,
                id_modulo: Modulo.PENSION,
                id_tabla: tabla,
                id_configuracion: 1,
                activo: 'S'
            });
        },

        updateParametro(id: number, data: any) {
            return peticionService.actualizar(`configuracionparametros/${id}`, data);
        },

        deleteParametro(id: number) {
            return peticionService.eliminar('configuracionparametros', { id });
        },
    },

    // ==================== REPORTES ====================
    reportes: {
        descargarPdf(tipo: 'activas' | 'historial_mes' | 'todas') {
            return api.get(`/pension/reporte/${tipo}`, { responseType: 'blob' });
        }
    }
};

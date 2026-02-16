import PeticionService from './peticion.service';

export interface ModuloConfiguracion {
    id: number;
    descripcion: string;
    identificador: string;
    activo: string;
}

export interface TablaConfiguracion {
    id: number;
    id_modulo: number;
    nombre: string;
    descripcion: string;
    activo: string;
}

class ConfiguracionModulosService {
    private peticionService: PeticionService;

    constructor() {
        this.peticionService = new PeticionService();
    }

    async getModulos() {
        return await this.peticionService.obtenerGet('configuracionmodulos');
    }

    async getTodasLasTablas() {
        return await this.peticionService.obtenerGet('configuracionmodulos/tablas');
    }

    async getTablasPorModulo(moduloId: number) {
        return await this.peticionService.obtenerGet(`configuracionmodulos/${moduloId}/tablas`);
    }
}

export default new ConfiguracionModulosService();

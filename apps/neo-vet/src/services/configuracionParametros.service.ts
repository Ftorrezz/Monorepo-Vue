import NdPeticionControl from 'src/controles/rest.control';

export interface ConfiguracionParametro {
    id?: number;
    id_modulo: number;
    id_tabla: number;
    descripcion: string;
    identificador?: string;
    paridad?: string;
    activo: string;
    id_sitio?: number;
}

class ConfiguracionParametrosService {

    constructor() {
    }

    async getParametros(idModulo: number, idTabla: number) {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('configuracionparametros', 'get', null, {
            filtro: { id_modulo: idModulo, id_tabla: idTabla, id_configuracion: 1 }
            //todo:id_configuracion obtener de la tabla configuracion_parametros, es el id del parametro que se quiere obtener, por ejemplo: 1 para obtener el parametro de "mostrar_imagenes_estudios"
        });
    }

    async crearParametro(parametro: ConfiguracionParametro) {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('configuracionparametros', 'post', parametro);
    }

    async actualizarParametro(parametro: ConfiguracionParametro) {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('configuracionparametros', 'put', parametro);
    }

    async eliminarParametro(parametro: ConfiguracionParametro) {
        const peticion = new NdPeticionControl();
        return await peticion.invocarMetodo('configuracionparametros', 'delete', parametro);
    }
}

export default new ConfiguracionParametrosService();

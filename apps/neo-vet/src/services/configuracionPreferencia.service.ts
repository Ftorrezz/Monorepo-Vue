import NdPeticionControl from 'src/controles/rest.control';

export interface Preferencia {
  id?: number;
  identificador: string;
  valor: string;
  id_sucursal: number;
  tip_dato: string;
}

class ConfiguracionPreferenciaService {
  async getPreferenciasPorSucursal(idSucursal: number): Promise<Preferencia[]> {
    const peticion = new NdPeticionControl();
    return await peticion.invocarMetodo('configuracionpreferencia', 'get', null, {
      filtro: { id_sucursal: idSucursal }
    });
  }

  async guardarPreferencia(preferencia: Preferencia): Promise<any> {
    const peticion = new NdPeticionControl();
    if (preferencia.id) {
      return await peticion.invocarMetodo('configuracionpreferencia', 'put', preferencia);
    } else {
      return await peticion.invocarMetodo('configuracionpreferencia', 'post', preferencia);
    }
  }
}

export default new ConfiguracionPreferenciaService();

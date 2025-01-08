import NdPeticionControl from "src/controles/rest.control";
import NdAlertasControl from "src/controles/alertas.control";
import { DtoParametros } from "src/controles/dto.parametros";

export default function useFuncionesGenericas() {


  const verificaAccesoPantalla = async (pantalla) => {
    try {

      const _peticion = new NdPeticionControl();

      let _unDtoParametros = new DtoParametros();
      _unDtoParametros.filtro = { pantalla, 'id_configuracion': 1 };

      const _respuesta = await _peticion.invocarMetodo(`usuarioacceso/accesopantalla`, "post", _unDtoParametros);

      if (_respuesta[0] == true) return true;
      else return false;



    } catch (error) {

      let alertas = new NdAlertasControl();

      alertas.mostrarMensaje(
        "error",
        'verificaAccesoPantalla',
        "Error al obtener el acceso"
      );
    }
  };

  return {
    verificaAccesoPantalla
  };
}

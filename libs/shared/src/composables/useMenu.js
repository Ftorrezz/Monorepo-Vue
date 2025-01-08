import NdPeticionControl from "src/controles/rest.control";
import { ref, toRefs } from 'vue';

const useMenu = () => {
  
  let _respuesta = [];
  const obtenerMenu = async ( menu )=> {

    try {
    
      const _peticion = new NdPeticionControl();

      _respuesta = await _peticion.invocarMetodo('menu', 'get', menu );
            
      if (_respuesta)
        return _respuesta
      else []

    } catch (error) {
      return { ok: false, _respuesta: 'No fue posible realizar el envio del correo electronico' }
    }
    

  };

  

  return {  obtenerMenu };
};

export default useMenu;

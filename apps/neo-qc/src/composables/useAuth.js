import NdPeticionControl from "src/controles/rest.control";
import { useAuthStore } from "src/stores/Auth";
import { computed } from "vue";


const useAuth = () => {
  const store = useAuthStore();

  const loginUser = async (user) => {
    const resp = await store.iniciarSesionUsuario( user );
    return resp;
  };

  const checkAuthStatus = async () => {
    const resp = await store.checkAuthentication();
    return resp;
  };

  const solicitarCodigoRecuperacion = async ( _usuario )=> {

    try {
    
      const _peticion = new NdPeticionControl();

      const _respuesta = await _peticion.invocarMetodo('autorizacion/recuperarclave', 'post', _usuario);

      if (_respuesta && _respuesta[0] && _respuesta[0].valor) {
            
        if (_respuesta[0].valor === true){
           return { ok: true, _respuesta: _respuesta[0].respuesta }}
        else { { ok: false } }
      }
      else return { ok: false, _respuesta: 'No fue posible realizar el envio del correo electronico' };

    } catch (error) {
      return { ok: false, _respuesta: 'No fue posible realizar el envio del correo electronico' }
    }
    

  };

  const actualizarClaveUsuario = async ( _usuario ) => {
     
    try{
      const _peticion = new NdPeticionControl();

      const _respuesta = await _peticion.invocarMetodo('autorizacion/actualizarclave', 'post', _usuario);

      console.log(_respuesta)
    
    if (_respuesta && _respuesta[0] && _respuesta[0].valor) {
            
      return { ok: true, _respuesta: _respuesta[0].respuesta };
    }
      else return { ok: false, _respuesta: 'No fue posible actualizar la clave' };

    } catch (error) {
      return { ok: false, _respuesta: 'No fue posible actualizar la clave' }
    }
  }

  const logout = () => {
    store.logout();
    
  };

  return {
    loginUser,
    logout,
    checkAuthStatus,
    solicitarCodigoRecuperacion,
    actualizarClaveUsuario,

    authStatus: computed({
      get() {
        return store.currentState;// getters["currentState"];
      },
      set() {
        store.logout();
      },
    }),

    //authStatus: computed(()=> store.getters['login/currentState']),
    username: computed(() => store.username)
  };
};

export default useAuth;

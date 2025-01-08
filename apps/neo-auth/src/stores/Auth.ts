import { defineStore } from 'pinia';
import { Usuario } from '../../../../libs/shared/src/interfaces/usuario.interfaz';
import NdEncriptacion from 'src/controles/encriptacion';
import NdPeticionControl from 'src/controles/rest.control';

export const useAuthStore = defineStore('useAuthStore', {

  state: () => ({
    estado: 'autenticando', // 'authenticated','not-authenticated', 'authenticating'
    usuario: null,
    token: null,
    refreshToken: null,
    sucursal: null

  }),

  getters: {
    currentState: (state) => state.estado,

    username: (state) => state.usuario,

    userToken: (state) => state.token,

    userSucursal: (state) => state.sucursal

  },
  actions: {

    async iniciarSesionUsuario(parametro: Usuario) {

      try {

        const _peticion = new NdPeticionControl();
        const _encriptacion = new NdEncriptacion()

        let _claveUsuario: string = _encriptacion.encriptar(parametro.clave);
        //parametro.clave = _claveUsuario;
        
        let Usuario = {
          nombreusuario: parametro.nombreusuario,
          clave: _claveUsuario//'$2a$10$26xx5rrQR/BO1lbqB1yUxe58zTQWv9TGczsQzkKPWP/Zff63VzpIq'
        };

        const respuesta = await _peticion.invocarMetodo('autorizacion/login', 'post', Usuario);

        const {token, usuario} = respuesta[0]
                
        if (token) {

          this.usuario = usuario.nombreusuario;
          this.token = token;
          //this.refreshToken = refreshToken
          //this.sucursal = sucursalusuario
          //localStorage.setItem("token", token);

          this.estado = "autenticado";
          return { ok: true };
        }

        /*if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }*/

        
        return { ok: false };

      } catch (error) {
        return { ok: false, error };
      }
    },

    async checkAuthentication() {
     
    
        if (!this.token) {
          
          this.logout()
          return { ok: false, message: "No hay token" };
        }
      
        try {
          /*let tokenVencido = false;
          let fechaActual = Date.now() / 1000;
      
          let { exp, nombreusuario } = decode(token);
      
          if (exp < fechaActual) {
            tokenVencido = true;
          }
      
          if (tokenVencido) {
            commit("logout");
            return { ok: false, message: "Token vencido" };
          } else {
            commit("loginUser", { nombreusuario, token, refreshToken });
      
            return { ok: true };
          }*/
        } catch (error) {
          this.logout()
          return { ok: false};
        }
      



    },

    logout() {
     
      this.usuario = null;
      this.token = null;
      this.refreshToken = null;
      this.estado = "no-autenticado";
      this.sucursal = null;

    }

  },
  persist: true //con esta linea utilizo el plugin para mantener el estado global porque voy a necesitar el token y el usuario en todo el sistema
  
});

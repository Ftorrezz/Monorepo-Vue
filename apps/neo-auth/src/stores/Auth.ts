import { defineStore } from 'pinia';
import { Usuario } from '../../../../libs/shared/src/interfaces/usuario.interfaz';
import NdEncriptacion from 'src/controles/encriptacion';
import NdPeticionControl from 'src/controles/rest.control';
import { Sucursal } from '../../../../libs/shared/src/interfaces/sucursal.interfaz';
import { DtoParametros } from 'src/controles/dto.parametros';
import { TokenDto } from '../../../../libs/shared/src/dto/token.dto'
export const useAuthStore = defineStore('useAuthStore', {

  state: () => ({
    estado: 'autenticando', // 'authenticated','not-authenticated', 'authenticating'
    usuario: null,
    token: null,
    refreshToken: null,
    sucursales: [] as Sucursal[],
    administrador: false,
    superadministrador: false
  }),

  getters: {
    currentState: (state) => state.estado,

    username: (state) => state.usuario,

    userToken: (state) => state.token,

    userSucursal: (state) => state.sucursales,

    useIsAdmin: (state) => state.administrador,
    
    useIsSuperAdmin: (state) => state.superadministrador

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
          clave: _claveUsuario
        };
        const respuesta = await _peticion.invocarMetodo('autorizacion/login', 'post', Usuario);

        const {token, usuario, sucursales, roles} = respuesta[0]

        if (token) {

          this.usuario = usuario.nombreusuario;
          this.token = token;
          this.administrador = roles.includes("SUPERVISOR");
          this.superadministrador = roles.includes("ADMINISTRADOR");

          this.sucursales = sucursales.map((sucursal: Sucursal) => ({
            id: sucursal.id,
            descripcion: sucursal.descripcion,
            abreviatura: sucursal.abreviatura,
            direccion: sucursal.direccion,
            responsable: sucursal.responsable,
            activo: sucursal.activo,
            imagen: "https://via.placeholder.com/400x200?text=" + encodeURIComponent(sucursal.abreviatura),
            id_sitio: sucursal.id_sitio,
          }));

          this.estado = "autenticado";
          return { ok: true };
        }


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

          const dto: TokenDto = new TokenDto(this.token);

          const _peticion = new NdPeticionControl();

          const respuesta = await _peticion.invocarMetodo('autorizacion/actualizartoken', 'post', dto);

          const {token, usuario, sucursales} = respuesta[0]

        if (token) {


          this.usuario = usuario.nombreusuario;
          this.token = token;

          this.estado = "autenticado";
          return { ok: true };
        } else {

          this.logout()
          return { ok: false, message: "Token invalido" };
        }

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
      this.sucursales = [];
      this.administrador = false;
      this.superadministrador = false;

    }

  },
  persist: true //con esta linea utilizo el plugin para mantener el estado global porque voy a necesitar el token y el usuario en todo el sistema

});

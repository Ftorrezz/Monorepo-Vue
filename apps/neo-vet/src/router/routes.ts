import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      {
        path: '',
        name: 'inicio',
        component: () => import('pages/Index.vue'),
        meta: { requireAuth: true }
      },

      {
        path: '/config/mascota/color',
        name: 'color',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/color.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/mascota/sexo',
        name: 'sexo',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/sexo.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/mascota/habitat',
        name: 'habitat',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/habitat.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/mascota/especie',
        name: 'especie',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/especie.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/mascota/razamascota',
        name: 'razamascota',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/raza.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/mascota/caracter',
        name: 'caracter',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/caracter.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/mascota/dieta',
        name: 'dieta',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/dieta.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/diagnostico',
        name: 'diagnostico',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/diagnostico.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/especialidad',
        name: 'especialidad',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/especialidad.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/propietario/genero',
        name: 'genero',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/genero.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/config/propietario/escolaridad',
        name: 'escolaridad',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/escolaridad.vue'),
        meta: { requireAuth: false },

      },
      {
        path: '/config/propietario/estadocivil',
        name: 'estadocivil',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/estadocivil.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/config/propietario/ocupacion',
        name: 'ocupacion',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/ocupacion.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/config/propietario/raza',
        name: 'raza',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/raza.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/config/propietario/religion',
        name: 'religion',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/religion.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/ubicacion',
        name: 'ubicacion',
        component: () => import('pages/configuration/general/ubicacion.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/servicio',
        name: 'servicio',
        component: () => import('pages/configuration/general/servicio.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/tipoprofesional',
        name: 'tipoprofesional',
        component: () => import('pages/configuration/general/tipoprofesional.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/profesional',
        name: 'profesional',
        component: () => import('pages/configuration/general/profesional.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/config/plantillas',
        name: 'configuracion-plantillas',
        component: () => import('pages/configuration/plantillas/ConfiguracionPlantillas.vue'),
        meta: { requireAuth: false },
      },
      {
        path: '/templatemanager',
        name: 'templatemanager',
        component: () => import('pages/configuration/template/TemplateManager.vue'),
        meta: { requireAuth: false },
      },
      {
        path: "usuario",
        name: "usuario",
        component: () => import("src/pages/Usuario/Usuario.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "usuarioperfil",
        name: "usuarioperfil",
        component: () => import("src/pages/Usuario/UsuarioPerfil.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "usuarioacceso",
        name: "usuarioacceso",
        component: () => import("src/pages/Usuario/UsuarioAcceso.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "sitio",
        name: "sitio",
        component: () => import("pages/Institucional/Sitio.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "configuracion",
        name: "configuracion",
        component: () => import("src/pages/Institucional/SitioConfiguracion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "sucursal",
        name: "sucursal",
        component: () => import("src/pages/Institucional/Sucursal.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "tipositioubicacion",
        name: "tipositioubicacion",
        component: () => import("src/pages/Institucional/TipoSitioUbicacion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "sitioubicacion",
        name: "sitioubicacion",
        component: () => import("src/pages/Institucional/SitioUbicacion.vue"),
        meta: { requireAuth: true },
      },


    ],
    //meta: { requireAuth: true },

  },

  {
    path: '/propietariomascota',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'busquedapropietariomascota', component: () => import('pages/busqueda/BusquedaPropietarioMascota.vue') }],
    meta: { requireAuth: false },

  },

  {
    path: '/agenda',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '', name: 'agenda', component: () => import('pages/agenda/Agenda.vue') },
      { path: '/agendaservicio', name: 'agendaservicio', component: () => import('pages/configuration/agenda/Servicio.vue') },
      { path: '/generar-agenda', name: 'generar-agenda', component: () => import('pages/configuration/agenda/GenerarAgenda.vue') },
      { path: '/config/citamotivo', name: 'citamotivo', component: () => import('pages/configuration/agenda/CitaMotivo.vue') },
    ],
    meta: { requireAuth: false },

  },
  {
    path: '/reportes',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'reportes', component: () => import('pages/ReportesPage.vue') }],
    meta: { requireAuth: false },

  },
  {
    path: '/atencionpaciente',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'atencionpaciente', component: () => import('pages/AtencionPaciente.vue') }],
    meta: { requireAuth: false },

  },
  {
    path: '/inventario',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'inventario', component: () => import('pages/inventario/Inventario.vue') },
    { path: '/categoria', name: 'categoria', component: () => import('pages/inventario/Categoria.vue') },
    { path: '/marca', name: 'marca', component: () => import('pages/inventario/marca.vue') },
    { path: '/producto', name: 'producto', component: () => import('pages/inventario/producto.vue') },
    { path: '/productotipo', name: 'productotipo', component: () => import('pages/configuration/inventario/TiposProducto.vue') },
    { path: '/proveedor', name: 'proveedor', component: () => import('pages/configuration/inventario/Proveedores.vue') },
    ],
    meta: { requireAuth: false },

  },
  {
    path: '/ventas',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'ventas', component: () => import('pages/ventas/Ventas.vue') }],
    meta: { requireAuth: false },

  },
  {
    path: '/pension',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'pension', component: () => import('pages/pension/Pension.vue') }],
    meta: { requireAuth: false },

  },

  {
    path: '/configuracionmodulo',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'configuracionmodulo', component: () => import('pages/Configuration/generico/ConfiguracionModulo.vue') }],
    meta: { requireAuth: false },

  },
  {
    path: '/configuracioncampo',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'configuracioncampo', component: () => import('pages/Configuration/generico/ConfiguracionCampo.vue') }],
    meta: { requireAuth: false },

  },
  {
    path: '/configuracionvalor',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'configuracionvalor', component: () => import('pages/Configuration/generico/ConfiguracionValor.vue') }],
    meta: { requireAuth: false },

  },

  {
    path: '/config/servicios-dinamicos',
    component: () => import('layouts/Layout.vue'),
    children: [
      {
        path: '',
        name: 'configuracion-servicios',
        component: () => import('pages/configuration/generico/ConfiguracionServicios.vue')
      },
      {
        path: ':id/estructura',
        name: 'configuracion-estructura-servicio',
        component: () => import('pages/configuration/generico/ConfiguracionEstructuraServicio.vue')
      }
    ],
    meta: { requireAuth: false },
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('pages/Usuario/Login.vue'),
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },



];

export default routes;

import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '',
        name: 'inicio',
        component: () => import('pages/Index.vue'),
        meta: { requireAuth: true },
      },




      ],
    meta: { requireAuth: true },

  },
  /*{
    path: "/gestionhospital",
    name: "gestionhospital",
    redirect: { name: "dashboardhospital" },
    component: () =>
      import("src/modules/GestionHospitalaria/layouts/HospitalLayout.vue"),
    children: [
      {
        path: "dashboardhospital",
        name: "dashboardhospital",
        component: () =>
          import("src/modules/GestionHospitalaria/pages/Dashboard.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "configuracion",
        name: "configuracion",
        component: () => import("pages/Configuracion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "sucursal",
        name: "sucursal",
        component: () => import("pages/General/Sucursal.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "pais",
        name: "pais",
        component: () => import("pages/General/Pais.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "estado",
        name: "estado",
        component: () => import("pages/General/Estado.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "delegacion",
        name: "delegacion",
        component: () => import("pages/General/Delegacion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "escolaridad",
        name: "escolaridad",
        component: () => import("pages/Persona/Escolaridad.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "estadocivil",
        name: "estadocivil",
        component: () => import("pages/Persona/EstadoCivil.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "entidad",
        name: "entidad",
        component: () => import("pages/General/Entidad.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "genero",
        name: "genero",
        component: () => import("pages/Persona/Genero.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "ocupacion",
        name: "ocupacion",
        component: () => import("pages/Persona/Ocupacion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "religion",
        name: "religion",
        component: () => import("pages/Persona/Religion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "tipoidentificacion",
        name: "tipoidentificacion",
        component: () => import("pages/Persona/TipoIdentificacion.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "busquedapacientes",
        name: "busquedapacientes",
        component: () => import("pages/BusquedaPacientes.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "busquedaclientemascota",
        name: "busquedaclientemascota",
        component: () => import("pages/BusquedaClienteMascota.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "busquedapaciente",
        name: "busquedapaciente",
        component: () => import("pages/Busqueda/busquedapaciente.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "cliente",
        name: "cliente",
        component: () => import("pages/Cliente.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "paciente",
        name: "paciente",
        component: () => import("src/pages/Paciente/Paciente.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "origenpaciente",
        name: "origenpaciente",
        component: () => import("src/pages/Paciente/OrigenPaciente.vue"),
        meta: { requireAuth: true },
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
        path: "usuariorol",
        name: "usuariorol",
        component: () => import("pages/Usuario/UsuarioRol.vue"),
        meta: { requireAuth: true },
      },

      {
        path: "usuarioacceso",
        name: "usuarioacceso",
        component: () => import("src/pages/Usuario/UsuarioAcceso.vue"),
        meta: { requireAuth: true },
      },

      {
        path: "pruebas",
        name: "pruebas",
        component: () => import("pages/Pruebas.vue"),
        meta: { requireAuth: true },
      },
      {
        path: "pruebafoto",
        name: "pruebafoto",
        component: () => import("pages/Pruebafoto.vue"),
        meta: { requireAuth: true },
      },
    ],
  },*/

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

import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '',
        name: 'inicio',
        component: () => import('pages/Index.vue'),
        meta: { requireAuth: false } },

      { path: '/color',
        name: 'color',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/color.vue'),
        meta: { requireAuth: false },

      },
      { path: '/sexo',
        name: 'sexo',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/sexo.vue'),
        meta: { requireAuth: false },

      },
      { path: '/habitat',
        name: 'habitat',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/habitat.vue'),
        meta: { requireAuth: false },

      },
      { path: '/especie',
        name: 'especie',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/especie.vue'),
        meta: { requireAuth: false },

      },
      { path: '/razamascota',
        name: 'razamascota',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/raza.vue'),
        meta: { requireAuth: false },

      },
      { path: '/caracter',
        name: 'caracter',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/caracter.vue'),
        meta: { requireAuth: false },

      },

    ],
    //meta: { requireAuth: true },

  },

  { path: '/propietariomascota',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'busquedapropietariomascota', component: () => import('pages/busqueda/BusquedaPropietarioMascota.vue') }],
        meta: { requireAuth: false },

      },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

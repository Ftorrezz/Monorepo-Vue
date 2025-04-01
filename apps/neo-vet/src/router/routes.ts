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
      
      /*{ path: '/propietariomascota',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'busquedapropietariomascota', component: () => import('pages/busqueda/BusquedaPropietarioMascota.vue') }],
        meta: { requireAuth: false },
    
      },*/
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

import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useAuthStore } from "src/stores/Auth"
import { Loading, QSpinnerDots } from 'quasar';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) =>{
    const store = useAuthStore();
    const rutaProtegida: boolean = to.matched.some(record => record.meta.requireAuth)

    // Mostrar loading al iniciar la navegación
    Loading.show({
      spinner: QSpinnerDots,
      spinnerColor: 'primary',
      backgroundColor: 'white',
      message: 'Cargando módulo...',
      messageColor: 'primary',
      customClass: 'modern-loading'
    });

    if (rutaProtegida && store.token === null ){
      next( { name: 'login' } )
    }else next()
  })

  Router.afterEach(() => {
    // Ocultar loading al finalizar la navegación
    Loading.hide();
  });
  
  /*Router.beforeEach((to, from, next) =>{
    //const store = useAuthStore();
    //const rutaProtegida: boolean = to.matched.some(record => record.meta.requireAuth)

    next()

  })*/

  return Router;
});

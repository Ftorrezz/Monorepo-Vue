import { defineStore } from 'pinia';
import { Sucursal } from '../../../../libs/shared/src/interfaces/sucursal.interfaz'
export const useDialogStore = defineStore("useDialogStore", {
  state: () => ({
    showSucursalDialog: false,
    sucursales: [] as Sucursal[],
    sucursalSeleccionada: null as Sucursal | null,
  }),
  actions: {
    openDialog(sucursales: Sucursal[]) {
      this.sucursales = sucursales;
      this.showSucursalDialog = true;
      this.sucursalSeleccionada = null;
    },
    closeDialog() {

      this.sucursales.splice(0, this.sucursales.length);
      this.sucursalSeleccionada = null;
      this.showSucursalDialog = false;
    },
    selectBranch(sucursal: Sucursal) {
      this.sucursalSeleccionada = sucursal;
      this.sucursales.splice(0, this.sucursales.length);
      this.showSucursalDialog = false;
      //this.closeDialog();
    },
  },
  //persist: true
});

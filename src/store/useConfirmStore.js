import { defineStore } from 'pinia';

export const useConfirmStore = defineStore('confirm', {
  state: () => ({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Aceptar',
    cancelLabel: 'Cancelar',
    onConfirm: null, // Aquí guardaremos la función de descarga
  }),
  actions: {
    open({ title, message, confirmLabel, cancelLabel, onConfirm }) {
      this.title = title;
      this.message = message;
      this.confirmLabel = confirmLabel || 'Descargar';
      this.cancelLabel = cancelLabel || 'Cerrar';
      this.onConfirm = onConfirm;
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
      this.onConfirm = null;
    }
  }
});
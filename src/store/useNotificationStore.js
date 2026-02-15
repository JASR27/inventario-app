import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: []
  }),
  actions: {
    addNotification(title, message, type = 'info') {
      // 1. Forzamos el vaciado del array para eliminar cualquier rastro anterior
      this.notifications = []; 
      
      // 2. Usamos un pequeño delay técnico opcional o simplemente insertamos
      // para asegurar que Vue detecte el cambio de estado
      const id = Date.now();
      
      this.notifications.push({ 
        id, 
        title, 
        message, 
        type 
      });
    },
    
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    }
  }
});
<template>
  <Transition name="fade">
    <div v-if="store.isOpen" class="confirm-overlay" @click.self="store.close()">
      <div class="confirm-card">
        <div class="confirm-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
        </div>
        <h3>{{ store.title }}</h3>
        <p>{{ store.message }}</p>
        
        <div class="confirm-buttons">
          <button @click="handleAction" class="btn-primary">{{ store.confirmLabel }}</button>
          <button @click="store.close()" class="btn-secondary">{{ store.cancelLabel }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useConfirmStore } from '../store/useConfirmStore';
const store = useConfirmStore();

const handleAction = () => {
  if (store.onConfirm) store.onConfirm();
  store.close();
};
</script>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 11000;
  backdrop-filter: blur(4px);
}
.confirm-card {
  background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px;
  text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
}
.confirm-icon { margin-bottom: 15px; }
.confirm-buttons { display: flex; gap: 10px; margin-top: 25px; }
.btn-primary { 
  flex: 1; background: #10b981; color: white; border: none; 
  padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer;
}
.btn-secondary { 
  flex: 1; background: #f3f4f6; color: #4b5563; border: none; 
  padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
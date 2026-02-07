<template>
  <div class="modal-panel">
    <h2>Agregar pago</h2>

    <div class="form-column">
      <div class="form-group amount-group">
        <label for="amount">Monto</label>
        <div class="input-with-label">
          <input 
            id="amount" 
            type="number" 
            v-model.number="amount" 
            min="0.01" 
            max="10000000" 
            step="0.01"
          />
          <span class="currency-label">Bs.</span>
        </div>
      </div>

      <div class="form-group">
        <label for="method">Método</label>
        <select id="method" v-model="method">
          <option disabled value="">Seleccione un método</option>
          <option value="CASH">CASH</option>
          <option value="POS">POS</option>
        </select>
      </div>
    </div>

    <div class="button-group">
      <button type="button" @click="$emit('cerrar')">Cerrar</button>
      <button type="button" @click="guardarPago">Guardar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const amount = ref(0)
const method = ref('')

const emit = defineEmits(['guardar', 'cerrar'])

function guardarPago() {
  const errores = []

  if (isNaN(amount.value) || amount.value < 0.01 || amount.value > 10000000) {
    errores.push('El monto debe estar entre 0.01 y 10,000,000.')
  }

  if (!method.value.trim()) {
    errores.push('Debe seleccionar un método (CASH o POS).')
  }

  if (errores.length > 0) {
    alert(errores.join('\n'))
    return
  }

  const nuevoPago = {
    amount: parseFloat(amount.value),
    method: method.value
  }

  emit('guardar', nuevoPago)
  emit('cerrar')
}
</script>

<style scoped>
.modal-panel {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  margin: auto;
  margin-top: 2vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.input-with-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-label {
  font-weight: 600;
  color: #065f46;
}

input,
select {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  flex: 1;
}

input:focus,
select:focus {
  outline: none;
  border-color: #34d399;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button[type="button"] {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

button[type="button"]:first-child {
  background-color: #e5e7eb;
  color: #374151;
}

button[type="button"]:first-child:hover {
  background-color: #d1d5db;
}

button[type="button"]:last-child {
  background-color: #10b981;
  color: white;
}

button[type="button"]:last-child:hover {
  background-color: #059669;
}
</style>

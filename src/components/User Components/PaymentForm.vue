<template>
  <div class="modal-panel">
    <h2>Agregar pago</h2>

    <div class="form-grid">
      <div class="form-group">
        <label for="idPago">N° Identificación del pago</label>
        <input id="idPago" type="text" v-model="idPago" />
      </div>

      <div class="form-group">
        <label for="idPagador">N° Identificación del pagador</label>
        <input id="idPagador" type="text" v-model="idPagador" />
      </div>

      <div class="form-group">
        <label for="metodo">Método de pago</label>
        <select id="metodo" v-model="metodo">
          <option disabled value="">Seleccione un método</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="punto">Punto de venta</option>
          <option value="zelle">Zelle</option>
        </select>
      </div>

      <div class="form-group">
        <label for="monto">Monto</label>
        <input id="monto" type="number" v-model.number="monto" />
      </div>
    </div>

    <div class="button-group">
      <button type="button" @click="$emit('cerrar')">Cancelar</button>
      <button type="button" @click="guardarPago">Guardar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const idPago = ref('')
const idPagador = ref('')
const metodo = ref('')
const monto = ref(0)

const emit = defineEmits(['guardar', 'cerrar'])

function guardarPago() {
  const errores = []

  if (!idPago.value.trim()) errores.push('El ID del pago es obligatorio.')
  if (!idPagador.value.trim()) errores.push('El ID del pagador es obligatorio.')
  if (!metodo.value.trim()) errores.push('Debe seleccionar un método de pago.')
  if (isNaN(monto.value) || monto.value <= 0) errores.push('El monto debe ser un número positivo.')

  if (errores.length > 0) {
    alert(errores.join('\n'))
    return
  }

  const nuevoPago = {
    idPago: idPago.value.trim(),
    idPagador: idPagador.value.trim(),
    metodo: metodo.value.trim(),
    monto: parseFloat(monto.value)
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
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

input,
select {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
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

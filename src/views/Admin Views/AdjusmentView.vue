<template>
  <div class="layout">
    <Sidebar />

    <div class="carrito-panel" v-if="!mostrarSelector">
      <h2>Registrar Ajuste de Inventario</h2>

      <div class="top-actions">
        <div class="ajuste-info-box">
          <div class="ajuste-detalles">
            <div class="input-group">
              <label>Razón del Ajuste</label>
              <input type="text" v-model="ajuste" maxlength="50"
                placeholder="Ej: Mercancía dañada, error de conteo..." />
            </div>

            <div class="input-group-tipo">
              <label>Tipo de Ajuste</label>
              <select v-model="tipoAjuste" class="select-tipo">
                <option value="entrada">📈 Entrada (Sumar al stock)</option>
                <option value="salida">📉 Salida (Restar del stock)</option>
              </select>
            </div>
          </div>

          <button class="secundario btn-derecha" @click="mostrarSelectorProductos">
            Agregar Producto
          </button>
        </div>
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th style="width: 50px;"></th>
            <th>Producto</th>
            <th>Color</th>
            <th>Talla</th>
            <th>SKU</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in carrito" :key="index">
            <td style="text-align: center;">
              <button class="btn-eliminar" @click="eliminarProducto(index)">×</button>
            </td>
            <td>
              <div class="nombre-producto">{{ item.nombre }}</div>
              <div class="subtexto-marca">{{ item.marca }}</div>
            </td>
            <td>
              <select v-model="item.color" @change="seleccionarColor(item)" class="select-table">
                <option :value="null" disabled>Color</option>
                <option v-for="c in item.colores" :key="c" :value="c">{{ c }}</option>
              </select>
            </td>
            <td>
              <select v-model="item.talla" @change="seleccionarTalla(item)" :disabled="!item.color"
                class="select-table">
                <option :value="null" disabled>Talla</option>
                <option v-for="t in item.tallasDisponibles" :key="t" :value="t">{{ t }}</option>
              </select>
            </td>
            <td>
              <span class="sku-badge" v-if="item.sku">{{ item.sku }}</span>
              <span class="sku-placeholder" v-else>Pendiente...</span>
            </td>
            <td>
              <div class="cantidad-container">
                <input type="number" v-model.number="item.cantidad" min="1"
                  :max="tipoAjuste === 'salida' ? obtenerStockActual(item) : 9999" class="input-cantidad"
                  :disabled="!item.talla" @input="validarExcesoStock(item)" />
                <small v-if="item.talla && tipoAjuste === 'salida'" class="stock-info">
                  Disp: {{ obtenerStockActual(item) }}
                </small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="bottom-actions-container">
        <button class="cancelar" @click="cancelarCarrito">Cancelar</button>
        <button class="guardar" @click="guardarCarrito" :disabled="carrito.length === 0">
          Confirmar Ajuste
        </button>
      </div>
    </div>

    <ProductSelector v-if="mostrarSelector" modo="ajuste" @seleccionar="agregarProducto"
      @cerrar="mostrarSelector = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue'
import ProductSelector from '../../components/Admin Components/ProductSelector.vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'

const notificationStore = useNotificationStore()

const carrito = ref([])
const ajuste = ref('')
const tipoAjuste = ref('entrada')
const mostrarSelector = ref(false)

// Validación: 6-50 caracteres, alfanuméricos, espacios y . _ -
const razonRegex = /^[a-zA-Z0-9._\- ]{6,50}$/

async function agregarProducto(producto) {
  try {
    const res = await fetch(`http://localhost:8080/product/detail/${producto.id}`)
    const data = await res.json()
    const variantes = Array.isArray(data) ? data : (data.value || [])

    carrito.value.push({
      id: producto.id,
      nombre: producto.name,
      marca: producto.brand?.name || '',
      color: null,
      talla: null,
      sku: '',
      cantidad: 1,
      productDetailId: null,
      colores: [...new Set(variantes.map(v => v.color))],
      tallasDisponibles: [],
      variantes: variantes
    })
  } catch (e) {
    notificationStore.addNotification("Error de Datos", "No se pudieron cargar los detalles de este producto.", "error")
  }
  mostrarSelector.value = false
}

function seleccionarColor(item) {
  item.talla = null
  item.sku = ''
  const tallas = item.variantes.filter(v => v.color === item.color).map(v => v.size)
  item.tallasDisponibles = [...new Set(tallas)].sort((a, b) => a - b)
}

function seleccionarTalla(item) {
  const v = item.variantes.find(v => v.color === item.color && v.size === item.talla)
  if (v) {
    item.productDetailId = v.id
    const prefijo = item.nombre.substring(0, 3).toUpperCase()
    item.sku = `${prefijo}-${item.id}-${item.talla}-${item.color.toUpperCase()}`
  }
}

function obtenerStockActual(item) {
  const v = item.variantes.find(v => v.id === item.productDetailId)
  return v ? v.stock : 0
}

function validarExcesoStock(item) {
  if (tipoAjuste.value === 'salida') {
    const stockMax = obtenerStockActual(item);
    if (item.cantidad > stockMax) {
      item.cantidad = stockMax; // Forzamos el valor al máximo disponible
      
      notificationStore.addNotification(
        "Límite alcanzado", 
        `Solo hay ${stockMax} unidades disponibles de este producto.`, 
        "warning"
      );
    }
  }
}

async function guardarCarrito() {
  const razonLimpia = ajuste.value.trim()

  // 1. Validar Razón
  if (!razonRegex.test(razonLimpia)) {
    return notificationStore.addNotification(
      "Razón Inválida",
      "La razón debe tener entre 6 y 50 caracteres (solo letras, números y . _ -)",
      "warning"
    )
  }

  // 2. Validar Carrito y Stock
  for (const item of carrito.value) {
    if (!item.productDetailId) {
      return notificationStore.addNotification(
        "Datos Incompletos",
        `Seleccione color y talla para: ${item.nombre}`,
        "warning"
      )
    }

    if (item.cantidad <= 0) {
      return notificationStore.addNotification(
        "Cantidad Inválida",
        `La cantidad para ${item.nombre} debe ser mayor a 0`,
        "warning"
      )
    }

    if (tipoAjuste.value === 'salida') {
      const stockActual = obtenerStockActual(item)
      if (item.cantidad > stockActual) {
        return notificationStore.addNotification(
          "Stock Insuficiente",
          `No puedes retirar ${item.cantidad} unidades de ${item.nombre}. Disponible: ${stockActual}`,
          "error"
        )
      }
    }
  }

  // 3. Preparar Envío
  try {
    const employeeId = getEmployeeIdFromCookie()
    if (!employeeId) {
      return notificationStore.addNotification("Sesión Expirada", "No se encontró el ID del responsable. Reingresa al sistema.", "error")
    }

    const body = {
      employeeId: employeeId,
      reason: razonLimpia,
      items: carrito.value.map(i => ({
        productDetailId: i.productDetailId,
        quantity: tipoAjuste.value === 'salida' ? -Math.abs(i.cantidad) : Math.abs(i.cantidad)
      }))
    }

    const res = await fetch("http://localhost:8080/adjustment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error(await res.text())

    notificationStore.addNotification(
      "Ajuste Registrado",
      `Se ha procesado el ajuste de ${tipoAjuste.value} correctamente.`,
      "success"
    )
    cancelarCarrito()
  } catch (e) {
    notificationStore.addNotification("Error de Sistema", "No se pudo procesar el ajuste en el servidor.", "error")
  }
}

function getEmployeeIdFromCookie() {
  const match = document.cookie.match(/userid=(\d+)/)
  return match ? parseInt(match[1]) : null
}

const mostrarSelectorProductos = () => mostrarSelector.value = true
const eliminarProducto = (index) => carrito.value.splice(index, 1)

function cancelarCarrito() {
  carrito.value = []
  ajuste.value = ''
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #fff7ed;
}

.carrito-panel {
  background-color: #fff7ed;
  padding: 2rem;
  border-radius: 12px;
  font-family: "Inter", sans-serif;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: #9a3412;
  text-align: center;
}

.ajuste-info-box {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: #ffffff;
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid #fdba74;
}

.ajuste-detalles {
  display: flex;
  gap: 1.5rem;
  flex-grow: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 2;
}

.input-group-tipo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.input-group label,
.input-group-tipo label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #9a3412;
}

.input-group input,
.select-tipo {
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #fdba74;
  outline: none;
  font-family: inherit;
  font-size: 0.95rem;
}

.btn-derecha {
  margin-left: auto;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tabla-productos th {
  background-color: #ffedd5;
  padding: 0.85rem;
  color: #9a3412;
  text-align: left;
}

.tabla-productos td {
  padding: 0.85rem;
  border-bottom: 1px solid #fed7aa;
  color: #431407;
}

.sku-badge {
  background-color: #e2e8f0;
  color: #475569;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.85rem;
  border: 1px solid #cbd5e1;
}

.subtexto-marca {
  font-size: 0.75rem;
  color: #6b7280;
}

.cantidad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.input-cantidad {
  width: 70px;
  text-align: center;
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #fdba74;
}

.stock-info {
  font-size: 0.7rem;
  color: #ea580c;
  font-weight: 600;
}

.select-table {
  padding: 0.3rem;
  border-radius: 6px;
  border: 1px solid #fdba74;
  font-size: 0.9rem;
  min-width: 110px;
}

.bottom-actions-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

button.guardar {
  background-color: #f97316;
  color: white;
}

button.secundario {
  background-color: #fcd34d;
  color: #78350f;
  margin-top: 20px;
}

button.secundario:hover {
  background-color: #fbbf24;
}

button.cancelar {
  background-color: #f3f4f6;
  color: #374151;
}

button.btn-eliminar {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.2rem;
}

button:hover:not(:disabled) {
  filter: brightness(0.95);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
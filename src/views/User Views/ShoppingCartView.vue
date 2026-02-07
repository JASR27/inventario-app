<template>
    <div class="layout">
        <Sidebar />

        <!-- Panel del carrito -->
        <div class="carrito-panel" v-if="!mostrarSelector && !mostrarPago && !mostrarPagos">
            <h2>Carrito de compras</h2>

            <div class="top-actions">
                <button class="secundario" @click="mostrarSelectorProductos">Agregar producto</button>
            </div>

            <table class="tabla-productos">
                <thead>
                    <tr>
                        <th></th> <!-- Columna para el botón -->
                        <th>Nombre</th>
                        <th>Color</th>
                        <th>Talla</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in carrito" :key="index">
                        <td>
                            <button class="eliminar-producto" @click="eliminarProducto(index)">X</button>
                        </td>
                        <td>{{ item.nombre }}</td>
                        <td>
                            <select v-model="item.color">
                                <option v-for="c in colores" :key="c" :value="c">{{ c }}</option>
                            </select>
                        </td>
                        <td>
                            <select v-model="item.talla">
                                <option v-for="t in tallas" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </td>
                        <td>
                            <select v-model="item.cantidad">
                                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                            </select>
                        </td>
                        <td>{{ formato(item.precio) }}</td>
                        <td>{{ formato(item.precio * item.cantidad) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="total-pagar">
                <strong>Total a pagar:</strong> {{ formato(totalGeneral) }}<br />
                <strong>Total pagado:</strong> {{ formato(totalPagado) }}<br />
                <strong>Diferencia:</strong> {{ formato(diferencia) }}
            </div>


            <div class="bottom-actions">
                <button class="secundario" @click="mostrarFormularioPago">Agregar pago</button>
                <button class="secundario" @click="mostrarListaPagos">Ver pagos</button>
                <button class="cancelar" @click="cancelarCarrito">Cancelar</button>
                <button class="guardar" @click="guardarCarrito">Guardar</button>
            </div>
        </div>

        <!-- Vistas emergentes fuera del carrito -->
        <ProductSelector v-if="mostrarSelector" :productos="inventario" @seleccionar="agregarProducto"
            @cerrar="mostrarSelector = false" />

        <PaymentForm v-if="mostrarPago" @guardar="agregarPago" @cerrar="mostrarPago = false" />

        <PaymentList v-if="mostrarPagos" :pagos="pagos" @eliminar="eliminarPago" @cerrar="mostrarPagos = false" />
    </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'
import ProductSelector from '../../components/User Components/ProductSelector.vue'
import PaymentForm from '../../components/User Components/PaymentForm.vue'
import PaymentList from '../../components/User Components/PaymentList.vue'

const carrito = ref([])
const pagos = ref([])

const colores = ['Negro', 'Blanco', 'Rojo', 'Azul']
const tallas = ['36', '37', '38', '39', '40', '41']

const mostrarSelector = ref(false)
const mostrarPago = ref(false)
const mostrarPagos = ref(false)

function agregarProducto(producto) {
    carrito.value.push({ ...producto, color: colores[0], talla: tallas[0], cantidad: 1 })
    mostrarSelector.value = false
}

function mostrarSelectorProductos() {
    mostrarSelector.value = true
}

function mostrarFormularioPago() {
    mostrarPago.value = true
}

function mostrarListaPagos() {
    mostrarPagos.value = true
}

function cancelarCarrito() {
    carrito.value = []
    pagos.value = []
}

function guardarCarrito() {
    console.log('Carrito guardado:', carrito.value, pagos.value)
}

const totalGeneral = computed(() =>
    carrito.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
)

function formato(valor) {
    return 'Bs ' + valor.toFixed(2)
}

const inventario = ref([
    { nombre: 'Zapato Deportivo', descripcion: 'Cómodo para correr', marca: 'Nike', precio: 120 },
    { nombre: 'Botín Casual', descripcion: 'Ideal para oficina', marca: 'Clarks', precio: 180 },
    { nombre: 'Sandalia Clásica', descripcion: 'Fresca y ligera', marca: 'Crocs', precio: 90 }
])

function agregarPago(pago) {
    pagos.value.push(pago)
}

const totalPagado = computed(() =>
    pagos.value.reduce((acc, pago) => acc + pago.monto, 0)
)

const diferencia = computed(() =>
    totalGeneral.value - totalPagado.value
)

function eliminarPago(index) {
    pagos.value.splice(index, 1)
}

function eliminarProducto(index) {
    carrito.value.splice(index, 1)
}

</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background-color: #f0fdf4;
}

.sidebar {
    width: 250px;
    background-color: #ecfdf5;
    border-right: 1px solid #a7f3d0;
    padding: 1rem;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}

.carrito-panel {
    background-color: #f0fdf4;
    padding: 2rem;
    border-radius: 12px;
    font-family: "Inter", sans-serif;
    flex: 1;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
    font-size: 1.5rem;
    color: #166534;
    text-align: center;
    margin-bottom: 1rem;
}

.top-actions,
.bottom-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.eliminar-producto {
  color: #166534;
  margin: auto;
  text-align: center;
  border: none;
  padding: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  width: 40px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

button {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    transition: background-color 0.3s ease;
    
    /* ← ancho uniforme */
    text-align: center;
}

/* Botón Guardar */
button.guardar {
    background-color: #10b981;
    color: white;
}

button.guardar:hover {
    background-color: #059669;
}

/* Botones secundarios */
button.secundario {
    background-color: #d1fae5;
    color: #065f46;
}

button.secundario:hover {
    background-color: #a7f3d0;
}

/* Botón Cancelar */
button.cancelar, .eliminar-producto {
    background-color: #e5e7eb;
    color: #374151;
}

button.cancelar:hover, .eliminar-producto:hover {
    background-color: #d1d5db;
}

.tabla-productos {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
}

.tabla-productos th,
.tabla-productos td {
    padding: 0.75rem;
    border-bottom: 1px solid #a7f3d0;
    border-right: 1px solid #a7f3d0;
    /* ← separador vertical */
    text-align: left;
    color: #065f46;
    font-size: 0.95rem;
}

.tabla-productos th:last-child,
.tabla-productos td:last-child {
    border-right: none;
    /* ← evita doble borde al final */
}

select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #a7f3d0;
    background-color: #ffffff;
    font-family: "Inter", sans-serif;
    color: #1e293b;
}

.total-pagar {
    text-align: right;
    font-size: 1.1rem;
    color: #065f46;
    margin-top: 1rem;
}
</style>

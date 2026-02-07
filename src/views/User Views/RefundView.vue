<template>
    <div class="layout">
        <Sidebar />

        <!-- Vista de tabla de transacciones -->
        <div v-if="!mostrarFormularioDevolucion" class="devolucion-panel">
            <h2>Transacciones</h2>

            <div class="table-controls">
                <input type="text" v-model="busqueda" placeholder="Buscar por NID o fecha..." class="search-input" />
            </div>

            <table class="tabla-transacciones">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>NID Comprador</th>
                        <th>Cantidad de productos</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(transaccion, index) in transaccionesFiltradas" :key="index"
                        @click="seleccionarTransaccion(transaccion)">
                        <td>{{ transaccion.fecha }}</td>
                        <td>{{ transaccion.nid }}</td>
                        <td>{{ transaccion.productos.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Formulario de devolución -->
        <div v-else class="devolucion-formulario">
            <h2>
                Registrar devolución para NID: {{ transaccionSeleccionada.nid }} <br />
                <small style="font-weight: normal; color: #065f46;">Fecha: {{ transaccionSeleccionada.fecha }}</small>
            </h2>


            <table class="tabla-productos">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Color</th>
                        <th>Talla</th>
                        <th>Precio</th>
                        <th>Cantidad comprada</th>
                        <th>Cantidad a devolver</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(producto, index) in devoluciones" :key="index">
                        <td>{{ producto.nombre }}</td>
                        <td>{{ producto.color }}</td>
                        <td>{{ producto.talla }}</td>
                        <td>{{ formato(producto.precio) }}</td>
                        <td>{{ producto.cantidad }}</td>
                        <td>
                            <select v-model.number="producto.devolver">
                                <option v-for="n in producto.cantidad + 1" :key="n" :value="n - 1">{{ n - 1 }}</option>

                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="total-devolucion">
                <strong>Total a devolver:</strong> {{ formato(totalDevolver) }}
            </div>

            <div class="bottom-actions">
                <button class="secundario" @click="volverTabla">Volver</button>
                <button class="cancelar" @click="limpiarFormulario">Limpiar</button>
                <button class="guardar" @click="guardarDevolucion">Guardar devolución</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const transacciones = ref([
    {
        fecha: '2025-10-05',
        nid: 'V12345678',
        productos: [
            { nombre: 'Zapato Deportivo', color: 'Negro', talla: '40', precio: 120, cantidad: 2 },
            { nombre: 'Sandalia Clásica', color: 'Blanco', talla: '38', precio: 90, cantidad: 1 }
        ]
    },
    {
        fecha: '2025-10-06',
        nid: 'V87654321',
        productos: [
            { nombre: 'Botín Casual', color: 'Rojo', talla: '39', precio: 180, cantidad: 1 }
        ]
    }
])

const busqueda = ref('')
const mostrarFormularioDevolucion = ref(false)
const transaccionSeleccionada = ref(null)
const devoluciones = ref([])

const transaccionesFiltradas = computed(() =>
    transacciones.value.filter(t =>
        t.nid.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        t.fecha.includes(busqueda.value)
    )
)

function seleccionarTransaccion(transaccion) {
    transaccionSeleccionada.value = transaccion
    devoluciones.value = transaccion.productos.map(p => ({
        ...p,
        devolver: 0
    }))
    mostrarFormularioDevolucion.value = true
}

function volverTabla() {
    mostrarFormularioDevolucion.value = false
    transaccionSeleccionada.value = null
    devoluciones.value = []
}

function limpiarFormulario() {
    devoluciones.value.forEach(p => p.devolver = 0)
}

function guardarDevolucion() {
    const productosDevueltos = devoluciones.value.filter(p => p.devolver > 0)
    if (productosDevueltos.length === 0) {
        alert('Debe seleccionar al menos un producto para devolver.')
        return
    }
    console.log('Devolución registrada:', {
        nid: transaccionSeleccionada.value.nid,
        productos: productosDevueltos
    })
    volverTabla()
}

const totalDevolver = computed(() =>
    devoluciones.value.reduce((total, p) => total + p.precio * p.devolver, 0)
)

function formato(valor) {
    return 'Bs ' + valor.toFixed(2)
}
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background-color: #f0fdf4;
}

.devolucion-panel,
.devolucion-formulario {
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

.table-controls {
    display: flex;
    justify-content: flex-end;
}

.search-input {
    padding: 0.75rem;
    border: 1px solid #a7f3d0;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #fff;
    color: #1e293b;
    transition: border-color 0.3s ease;
    width: 300px;
}

.search-input:focus {
    outline: none;
    border-color: #34d399;
}

.tabla-transacciones,
.tabla-productos {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
}

.tabla-transacciones thead,
.tabla-productos thead {
    background-color: #d1fae5;
    color: #065f46;
}

.tabla-transacciones th,
.tabla-transacciones td,
.tabla-productos th,
.tabla-productos td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.tabla-transacciones tr:hover,
.tabla-productos tr:hover {
    background-color: #ecfdf5;
    cursor: pointer;
}

select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #a7f3d0;
    background-color: #ffffff;
    font-family: "Inter", sans-serif;
    color: #1e293b;
}

.total-devolucion {
    font-size: 1.1rem;
    color: #065f46;
    padding: 1rem;
    border-radius: 8px;
    text-align: right;
}

.bottom-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

button {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    transition: background-color 0.3s ease;
    text-align: center;
}

button.guardar {
    background-color: #10b981;
    color: white;
}

button.guardar:hover {
    background-color: #059669;
}

button.secundario {
    background-color: #d1fae5;
    color: #065f46;
}

button.secundario:hover {
    background-color: #a7f3d0;
}

button.cancelar {
    background-color: #e5e7eb;
    color: #374151;
}

button.cancelar:hover {
    background-color: #d1d5db;
}
</style>

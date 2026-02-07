<template>
    <div class="layout">
        <Sidebar />

        <!-- Vista de tabla de productos -->
        <div v-if="!mostrarFormularioReposicion" class="reposicion-panel">
            <h2>Reposiciones</h2>

            <div class="table-controls">
                <input type="text" v-model="busqueda" placeholder="Buscar producto por nombre o marca..."
                    class="search-input" />
            </div>

            <table class="tabla-productos">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Marca</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(producto, index) in productosFiltrados" :key="index"
                        @click="seleccionarProducto(producto)">
                        <td>{{ producto.nombre }}</td>
                        <td>{{ producto.marca }}</td>
                        <td>{{ producto.descripcion }}</td>
                        <td>{{ formato(producto.precio) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Formulario de reposición -->
        <div v-else class="reposicion-formulario">
            <h2>Registrar reposición: {{ productoSeleccionado.nombre }}</h2>

            <div class="campo-proveedor">
                <label for="proveedor">Proveedor:</label>
                <select id="proveedor" v-model="proveedorSeleccionado" class="select-proveedor">
                    <option disabled value="">Seleccione un proveedor</option>
                    <option v-for="p in proveedores" :key="p" :value="p">{{ p }}</option>
                </select>
            </div>


            <table class="tabla-productos">
                <thead>
                    <tr>
                        <th>Color</th>
                        <th>Talla</th>
                        <th>Cantidad</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(linea, index) in reposiciones" :key="index">
                        <td>
                            <select v-model="linea.color">
                                <option v-for="c in colores" :key="c" :value="c">{{ c }}</option>
                            </select>
                        </td>
                        <td>
                            <select v-model="linea.talla">
                                <option v-for="t in tallas" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" v-model.number="linea.cantidad" min="1" step="1"
                                @blur="validarCantidad(index)" class="input-cantidad" />
                        </td>
                        <td>
                            <button class="eliminar-producto" @click="eliminarLinea(index)">X</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="bottom-actions">
                <button class="secundario" @click="agregarLinea">Agregar línea</button>
                <button class="secundario" @click="volverTabla">Volver</button>
                <button class="cancelar" @click="limpiarFormulario">Limpiar</button>
                <button class="guardar" @click="guardarReposicion">Guardar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const inventario = ref([
    { nombre: 'Zapato Deportivo', descripcion: 'Cómodo para correr', marca: 'Nike', precio: 120 },
    { nombre: 'Botín Casual', descripcion: 'Ideal para oficina', marca: 'Clarks', precio: 180 },
    { nombre: 'Sandalia Clásica', descripcion: 'Fresca y ligera', marca: 'Crocs', precio: 90 }
])

const colores = ['Negro', 'Blanco', 'Rojo', 'Azul']
const tallas = ['36', '37', '38', '39', '40', '41']

const proveedores = ['Calzados El Ávila', 'Distribuidora Zulia', 'Importadora Global Shoes']
const proveedorSeleccionado = ref('')


const mostrarFormularioReposicion = ref(false)
const productoSeleccionado = ref(null)
const reposiciones = ref([])
const busqueda = ref('')

const productosFiltrados = computed(() =>
    inventario.value.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        p.marca.toLowerCase().includes(busqueda.value.toLowerCase())
    )
)

function seleccionarProducto(producto) {
    productoSeleccionado.value = producto
    reposiciones.value = [{ color: colores[0], talla: tallas[0], cantidad: 1 }]
    mostrarFormularioReposicion.value = true
}

function agregarLinea() {
    reposiciones.value.push({ color: colores[0], talla: tallas[0], cantidad: 1 })
}

function eliminarLinea(index) {
    reposiciones.value.splice(index, 1)
}

function volverTabla() {
    mostrarFormularioReposicion.value = false
    productoSeleccionado.value = null
    reposiciones.value = []
    proveedorSeleccionado.value = ''
}

function limpiarFormulario() {
    reposiciones.value = []
    proveedorSeleccionado.value = ''
}

function guardarReposicion() {
    if (!proveedorSeleccionado.value) {
        alert('Debe seleccionar un proveedor antes de guardar.')
        return
    }
    console.log('Reposición guardada:', {
        proveedor: proveedorSeleccionado.value,
        producto: productoSeleccionado.value,
        detalles: reposiciones.value
    })
    volverTabla()
}


function validarCantidad(index) {
    const cantidad = reposiciones.value[index].cantidad
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        reposiciones.value[index].cantidad = 1
    }
}

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

.reposicion-panel,
.reposicion-formulario {
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

.tabla-productos {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
}

.tabla-productos thead {
    background-color: #d1fae5;
    color: #065f46;
}

.tabla-productos th,
.tabla-productos td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.tabla-productos tr:hover {
    background-color: #ecfdf5;
    cursor: pointer;
}

select,
.input-cantidad {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #a7f3d0;
    background-color: #ffffff;
    font-family: "Inter", sans-serif;
    color: #1e293b;
}

.input-cantidad {
    width: 80px;
    text-align: center;
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

button.cancelar,
.eliminar-producto {
    background-color: #e5e7eb;
    color: #374151;
}

button.cancelar:hover,
.eliminar-producto:hover {
    background-color: #d1d5db;
}

.eliminar-producto {
    font-size: 0.85rem;
    width: 40px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.campo-proveedor {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.campo-proveedor label {
    font-weight: 600;
    color: #065f46;
}

.select-proveedor {
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid #a7f3d0;
    background-color: #ffffff;
    font-family: "Inter", sans-serif;
    color: #1e293b;
    min-width: 250px;
}
</style>

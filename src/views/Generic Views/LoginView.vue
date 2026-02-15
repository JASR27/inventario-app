<template>
  <div class="login-container">
    <h1>Iniciar sesión</h1>
    <form @submit.prevent="login">
      <input v-model="usuario" placeholder="Usuario" :disabled="cargando" required />
      <input v-model="clave" type="password" placeholder="Contraseña" :disabled="cargando" required />
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Verificando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../store/useNotificationStore.js' // Ajusta la ruta según tu proyecto

const usuario = ref('')
const clave = ref('')
const cargando = ref(false)
const router = useRouter()
const notificationStore = useNotificationStore()

function setCookie(nombre, valor, dias = 1) {
  const fecha = new Date()
  fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000))
  document.cookie = `${nombre}=${valor};expires=${fecha.toUTCString()};path=/`
}

async function login() {
  // Validación básica antes de disparar el fetch
  if (!usuario.value || !clave.value) {
    notificationStore.addNotification("Datos requeridos", "Por favor, ingrese usuario y contraseña.", "warning")
    return
  }

  cargando.value = true

  try {
    const respuesta = await fetch('http://localhost:8080/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: usuario.value,
        password: clave.value
      })
    })

    if (respuesta.status === 200) {
      const data = await respuesta.json();
      
      const userId = data.id;
      const userRole = data.role;

      // Guardar sesión
      localStorage.setItem('autenticado', 'true')
      setCookie('autenticado', 'true')
      setCookie('userid', userId)
      setCookie('username', usuario.value)

      

      if (userRole === "ADMIN") {
        localStorage.setItem('rol', 'admin')
        router.push('/dashboard/admin')
      } else {
        localStorage.setItem('rol', 'empleado')
        router.push('/dashboard/empleado')
      }

    } else if (respuesta.status === 409) {
      notificationStore.addNotification("Acceso Denegado", "Usuario o contraseña incorrectos.", "error")
    } else {
      notificationStore.addNotification("Error", "Error inesperado en el servidor.", "error")
    }
  } catch (error) {
    console.error('Error de conexión:', error)
    notificationStore.addNotification("Fallo de conexión", "No se pudo conectar con el servidor. Verifica tu red.", "error")
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* Tus estilos se mantienen iguales */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

.login-container {
  max-width: 320px;
  margin: 100px auto; /* Añadí un margen superior para centrarlo visualmente */
  padding: 2rem;
  background-color: #f0fdf4;
  color: #065f46;
  font-family: 'Inter', sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-container h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #166534;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  margin: 0.75rem 0;
  padding: 0.75rem;
  width: 90%;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background-color: #fff;
  color: #1e293b;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #34d399;
}

input:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
}

button {
  padding: 0.75rem 1.25rem;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s ease, transform 0.2s ease;
  background-color: #10b981;
  color: white;
  width: 100%; /* El botón ahora ocupa todo el ancho disponible */
}

button:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-2px);
}

button:disabled {
  background-color: #a7f3d0;
  cursor: not-allowed;
}
</style>

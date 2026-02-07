<template>
  <div class="login-container">
    <h1>Iniciar sesión</h1>
    <form @submit.prevent="login">
      <input v-model="usuario" placeholder="Usuario" required />
      <input v-model="clave" type="password" placeholder="Contraseña" required />
      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const usuario = ref('')
const clave = ref('')
const router = useRouter()

function setCookie(nombre, valor, dias = 1) {
  const fecha = new Date()
  fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000))
  document.cookie = `${nombre}=${valor};expires=${fecha.toUTCString()};path=/`
}

function login() {
  const usuarios = {
    admin: { clave: '1234', rol: 'admin', nombre: 'Administrador General' },
    empleado: { clave: '5678', rol: 'empleado', nombre: 'Jorge Sayegh' },
    coqui: { clave: '5678', rol: 'empleado', nombre: 'Coqui José' },
  }

  const user = usuarios[usuario.value]

  if (user && user.clave === clave.value) {
    // Guardar en localStorage
    localStorage.setItem('autenticado', 'true')
    localStorage.setItem('rol', user.rol)

    // Guardar en cookies
    setCookie('autenticado', 'true')
    setCookie('rol', user.rol)
    setCookie('usuario', user.nombre)       // nombre completo
    setCookie('username', usuario.value)    // username técnico

    // Redirigir según rol
    if (user.rol === 'admin') {
      router.push('/dashboard/admin')
    } else {
      router.push('/dashboard/empleado')
    }
  } else {
    alert('Credenciales incorrectas')
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

.login-container {
  max-width: 320px;
  margin: auto;
  padding: 2rem;
  background-color: #f0fdf4; /* Fondo claro institucional */
  color: #065f46; /* Texto verde institucional */
  font-family: 'Inter', sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-container h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #166534; /* Verde profundo */
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
  border: 1px solid #a7f3d0; /* Borde verde suave */
  border-radius: 8px;
  background-color: #fff;
  color: #1e293b; /* Texto oscuro */
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.3s ease;
}

input::placeholder {
  color: #4b5563;
}

input:focus {
  outline: none;
  border-color: #34d399; /* Verde brillante al enfocar */
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
}

/* Botón principal (submit) */
button[type="submit"],
button:not([type]) {
  background-color: #10b981;
  color: white;
}

button[type="submit"]:hover,
button:not([type]):hover {
  background-color: #059669;
  transform: translateY(-2px);
}

/* Botón secundario (limpiar, alternar, etc.) */
button[type="button"] {
  background-color: #d1fae5;
  color: #065f46;
}

button[type="button"]:hover {
  background-color: #a7f3d0;
  transform: translateY(-2px);
}
</style>




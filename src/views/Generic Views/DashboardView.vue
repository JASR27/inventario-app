<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const rol = localStorage.getItem('rol')

if (rol === 'admin') {
  router.replace('/dashboard/admin')
} else if (rol === 'empleado') {
  router.replace('/dashboard/empleado')
} else {
  router.replace('/')
}
</script>


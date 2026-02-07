<template>
  <div>
    <InventoryList :items="inventory" @export-data="handleExport" />
    <RepositionForm :selectedItems="selectedItems" />
  </div>
</template>

<script>
import InventoryList from './InventoryList.vue';
import RepositionForm from './RepositionForm.vue';

export default {
  components: { InventoryList, RepositionForm },
  data() {
    return {
      inventory: [
        { id: 1, name: 'Producto A' },
        { id: 2, name: 'Producto B' }
      ],
      selectedItems: []
    };
  },
  methods: {
    handleExport(data) {
      this.selectedItems = data;
    }
  }
}
</script>

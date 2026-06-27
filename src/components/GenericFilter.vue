<template>
  <q-card class="filter-card q-pa-md shadow-1">
    <div class="row q-col-gutter-md items-center">
      <div
        v-for="field in fields"
        :key="field.key"
        class="col-12 col-sm-4"
      >
        <q-input
          v-if="field.type === 'text'"
          v-model="filterValues[field.key]"
          :label="field.label"
          outlined
          dense
          clearable
          :error="errors[field.key]"
          :error-message="errors[field.key] ? 'Este campo es requerido' : ''"
          @update:model-value="clearFieldError(field.key)"
        />

        <q-select
          v-else-if="field.type === 'select'"
          v-model="filterValues[field.key]"
          :options="field.options"
          :label="field.label"
          outlined
          dense
          clearable
          emit-value
          map-options
          :error="errors[field.key]"
          :error-message="errors[field.key] ? 'Este campo es requerido' : ''"
          @update:model-value="clearFieldError(field.key)"
        />
      </div>

      <div class="col-12 col-sm-4 flex justify-end q-gutter-sm">
        <q-btn
          label="Limpiar"
          color="grey-7"
          flat
          no-caps
          @click="handleClear"
        />
        <q-btn
          label="Buscar"
          color="primary"
          unelevated
          no-caps
          icon="search"
          @click="handleSearch"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { FilterField } from '../types';

const props = defineProps<{
  fields: FilterField[];
}>();

const emit = defineEmits<{
  (e: 'search', values: Record<string, string>): void;
  (e: 'clear'): void;
}>();

const $q = useQuasar();

const filterValues = ref<Record<string, string>>({});
const errors = reactive<Record<string, boolean>>({});

const initFilters = () => {
  props.fields.forEach((field) => {
    filterValues.value[field.key] = filterValues.value[field.key] ?? '';
    errors[field.key] = false;
  });
};

initFilters();
watch(() => props.fields, initFilters, { deep: true });

const clearFieldError = (key: string) => {
  errors[key] = false;
};

const handleSearch = () => {
  let hasErrors = false;

  props.fields.forEach((field) => {
    if (field.required && (!filterValues.value[field.key] || filterValues.value[field.key] === '')) {
      errors[field.key] = true;
      hasErrors = true;
    } else {
      errors[field.key] = false;
    }
  });

  if (hasErrors) {
    $q.notify({
      type: 'negative',
      message: 'Por favor complete los campos obligatorios del filtro.',
      position: 'top',
    });
    return;
  }

  const nonQueryFields: Record<string, string> = {};
  Object.keys(filterValues.value).forEach((key) => {
    const val = filterValues.value[key];
    if (val !== undefined && val !== null && val !== '') {
      nonQueryFields[key] = val;
    }
  });

  emit('search', nonQueryFields);
};

const handleClear = () => {
  props.fields.forEach((field) => {
    filterValues.value[field.key] = '';
    errors[field.key] = false;
  });
  emit('clear');
  emit('search', {});
};
</script>

<style scoped lang="scss">
.filter-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}
</style>

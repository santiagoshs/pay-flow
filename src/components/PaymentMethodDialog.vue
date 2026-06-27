<template>
  <q-dialog
    v-model="isOpen"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="dialog-card q-pa-sm" style="width: 500px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold text-grey-9">
          {{ isEdit ? 'Editar Método de Pago' : 'Nuevo Método de Pago' }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          :disable="paymentsStore.loading"
        />
      </q-card-section>

      <q-form @submit.prevent="handleSave">
        <q-card-section class="q-gutter-md q-pt-md">
          <q-input
            v-model="form.name"
            label="Nombre del Método de Pago *"
            outlined
            dense
            lazy-rules
            :rules="[
              (val) => !!val || 'El nombre es obligatorio',
              (val) => val.trim().length >= 3 || 'El nombre debe tener al menos 3 caracteres'
            ]"
            :disable="paymentsStore.loading"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            label="Tipo de Método de Pago *"
            outlined
            dense
            emit-value
            map-options
            lazy-rules
            :rules="[(val) => !!val || 'El tipo es obligatorio']"
            :disable="paymentsStore.loading"
          />

          <q-input
            v-model="form.description"
            label="Descripción"
            type="textarea"
            outlined
            dense
            rows="3"
            :disable="paymentsStore.loading"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-px-md q-pb-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            no-caps
            v-close-popup
            :disable="paymentsStore.loading"
          />
          <q-btn
            type="submit"
            :label="isEdit ? 'Guardar Cambios' : 'Registrar'"
            color="primary"
            unelevated
            no-caps
            :loading="paymentsStore.loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { usePaymentsStore } from '../stores/payments';
import type { PaymentMethodType } from '../types';

const props = defineProps<{
  modelValue: boolean;
  paymentId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const paymentsStore = usePaymentsStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.paymentId);

interface FormState {
  name: string;
  type: PaymentMethodType | '';
  description: string;
}

const form = ref<FormState>({
  name: '',
  type: '',
  description: '',
});

const typeOptions = [
  { label: 'Tarjeta de Crédito', value: 'credit_card' },
  { label: 'Tarjeta de Débito', value: 'debit_card' },
  { label: 'Transferencia Bancaria', value: 'bank_transfer' },
  { label: 'Billetera Digital', value: 'digital_wallet' },
];

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.paymentId) {
        const item = paymentsStore.items.find((x) => x.id === props.paymentId);
        if (item) {
          form.value = {
            name: item.name,
            type: item.type,
            description: item.description,
          };
        }
      } else {
        form.value = {
          name: '',
          type: '',
          description: '',
        };
      }
    }
  }
);

const handleSave = async () => {
  if (!form.value.name || form.value.type === '') return;

  try {
    if (isEdit.value && props.paymentId) {
      await paymentsStore.updatePayment(props.paymentId, {
        name: form.value.name.trim(),
        type: form.value.type,
        description: form.value.description.trim(),
      });
      $q.notify({
        type: 'positive',
        message: 'Método de pago actualizado correctamente.',
        position: 'bottom-right',
      });
    } else {
      await paymentsStore.createPayment({
        name: form.value.name.trim(),
        type: form.value.type,
        description: form.value.description.trim(),
      });
      $q.notify({
        type: 'positive',
        message: 'Método de pago registrado con éxito.',
        position: 'bottom-right',
      });
    }
    emit('saved');
    isOpen.value = false;
  } catch {
    $q.notify({
      type: 'negative',
      message: paymentsStore.error || 'Error al procesar la solicitud.',
      position: 'bottom-right',
    });
  }
};
</script>

<style scoped lang="scss">
.dialog-card {
  border-radius: 16px;
  background-color: #ffffff;
}
</style>

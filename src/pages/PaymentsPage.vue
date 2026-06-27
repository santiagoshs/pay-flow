<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold text-grey-9 q-my-none font-outfit">Métodos de Pago</h1>
        <div class="text-subtitle2 text-grey-6 q-mt-xs font-outfit">Gestiona y consulta las cuentas de pago registradas</div>
      </div>
      <q-btn
        label="Agregar Método de Pago"
        icon="add"
        color="primary"
        unelevated
        no-caps
        class="action-btn text-weight-bold"
        @click="openCreateDialog"
      />
    </div>

    <div class="q-mb-md">
      <GenericFilter :fields="filterFields" @search="handleSearch" />
    </div>

    <q-card class="table-card shadow-1">
      <q-table
        :rows="paymentsStore.items"
        :columns="columns"
        row-key="id"
        flat
        :loading="paymentsStore.loading"
        no-data-label="No se encontraron métodos de pago"
        no-results-label="Ningún registro coincide con los filtros"
        binary-state-sort
        class="payments-table"
      >
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <span class="text-weight-medium">{{ getTypeLabel(props.value) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" align="center">
            <q-toggle
              :model-value="props.value === 'active'"
              color="positive"
              @update:model-value="handleToggleStatus(props.row.id)"
              :disable="paymentsStore.loading"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-createdAt="props">
          <q-td :props="props">
            <span class="text-grey-7">{{ formatDateTime(props.value) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="center" class="q-gutter-xs">
            <q-btn
              icon="edit"
              flat
              round
              dense
              color="primary"
              @click="openEditDialog(props.row.id)"
            />
            <q-btn
              icon="delete"
              flat
              round
              dense
              color="negative"
              @click="confirmDelete(props.row.id, props.row.name)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <PaymentMethodDialog
      v-model="dialogOpen"
      :payment-id="selectedPaymentId"
      @saved="loadPayments"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar, date } from 'quasar';
import { usePaymentsStore } from '../stores/payments';
import GenericFilter from '../components/GenericFilter.vue';
import PaymentMethodDialog from '../components/PaymentMethodDialog.vue';
import { filterFields, columns } from '../components/paymentConfig';
import type { PaymentMethodType } from '../types';

const $q = useQuasar();
const paymentsStore = usePaymentsStore();

const dialogOpen = ref(false);
const selectedPaymentId = ref<string | null>(null);
const currentFilters = ref<Record<string, unknown>>({});

const getTypeLabel = (type: PaymentMethodType): string => {
  const map: Record<PaymentMethodType, string> = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    bank_transfer: 'Transferencia Bancaria',
    digital_wallet: 'Billetera Digital',
  };
  return map[type] || type;
};

const formatDateTime = (isoString: string): string => {
  return date.formatDate(new Date(isoString), 'DD/MM/YYYY HH:mm');
};

const loadPayments = () => {
  void paymentsStore.fetchPayments(currentFilters.value);
};

onMounted(loadPayments);

const handleSearch = (filters: Record<string, unknown>) => {
  currentFilters.value = filters;
  loadPayments();
};

const handleToggleStatus = async (id: string) => {
  try {
    await paymentsStore.togglePaymentStatus(id);
  } catch {
    $q.notify({ type: 'negative', message: paymentsStore.error || 'No se pudo cambiar el estado.' });
  }
};

const openCreateDialog = () => {
  selectedPaymentId.value = null;
  dialogOpen.value = true;
};

const openEditDialog = (id: string) => {
  selectedPaymentId.value = id;
  dialogOpen.value = true;
};

const confirmDelete = (id: string, name: string) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar el método de pago "${name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    void paymentsStore.deletePayment(id)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Método de pago eliminado exitosamente.' });
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: paymentsStore.error || 'Error al eliminar.' });
      });
  });
};

watch(() => paymentsStore.error, (err) => {
  if (err) {
    $q.notify({
      type: 'negative',
      message: err,
      position: 'top',
      actions: [{ label: 'Cerrar', color: 'white', handler: () => paymentsStore.clearError() }]
    });
  }
});
</script>

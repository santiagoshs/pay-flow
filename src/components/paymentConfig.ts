import type { FilterField } from '../types';

export const filterFields: FilterField[] = [
  { key: 'name', label: 'Nombre del método', type: 'text' },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    options: [
      { label: 'Tarjeta de Crédito', value: 'credit_card' },
      { label: 'Tarjeta de Débito', value: 'debit_card' },
      { label: 'Transferencia Bancaria', value: 'bank_transfer' },
      { label: 'Billetera Digital', value: 'digital_wallet' },
    ],
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { label: 'Activo', value: 'active' },
      { label: 'Inactivo', value: 'inactive' },
    ],
  },
];

export const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const, sortable: true },
  { name: 'status', label: 'Estado (Activo)', field: 'status', align: 'center' as const, sortable: true },
  { name: 'createdAt', label: 'Fecha de Creación', field: 'createdAt', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'center' as const },
];

export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';

export type PaymentMethodStatus = 'active' | 'inactive';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  description: string;
  createdAt: string;
}

export interface User {
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  required?: boolean;
  options?: { label: string; value: string }[];
}

export interface GenericFilterProps {
  fields: FilterField[];
}

export interface AuthResponse {
  user: string;
  token: string;
}

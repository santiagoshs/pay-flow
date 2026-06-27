import type { User, PaymentMethod } from '../types';

const DB_NAME = 'payflow_db';
const DB_VERSION = 1;

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  private init(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('No se pudo abrir la base de datos local.'));
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'username' });
        }
        if (!db.objectStoreNames.contains('payments')) {
          db.createObjectStore('payments', { keyPath: 'id' });
        }

        const transaction = (event.target as IDBOpenDBRequest).transaction;
        if (transaction) {
          this.seedInitialData(db, transaction);
        }
      };
    });
  }

  private seedInitialData(db: IDBDatabase, transaction: IDBTransaction) {
    const userStore = transaction.objectStore('users');
    const paymentStore = transaction.objectStore('payments');

    userStore.put({
      username: 'admin',
      passwordHash: 'admin123',
      createdAt: new Date().toISOString()
    });

    const seedPayments: PaymentMethod[] = [
      {
        id: 'pay-1',
        name: 'Visa Corporativa Terminal',
        type: 'credit_card',
        status: 'active',
        description: 'Tarjeta corporativa principal para gastos de representación y viajes.',
        createdAt: '2026-06-21T10:00:00.000Z'
      },
      {
        id: 'pay-2',
        name: 'BBVA Cuenta de Nómina',
        type: 'bank_transfer',
        status: 'active',
        description: 'Cuenta empresarial para transferencias de nómina y pagos de servicios.',
        createdAt: '2026-06-22T14:30:00.000Z'
      },
      {
        id: 'pay-3',
        name: 'Paypal Fondos USD',
        type: 'digital_wallet',
        status: 'inactive',
        description: 'Billetera digital para transacciones internacionales y compras online.',
        createdAt: '2026-06-23T09:15:00.000Z'
      },
      {
        id: 'pay-4',
        name: 'Mastercard Débito Caja Chica',
        type: 'debit_card',
        status: 'active',
        description: 'Tarjeta física para gastos menores de oficina.',
        createdAt: '2026-06-24T16:00:00.000Z'
      },
      {
        id: 'pay-5',
        name: 'Santander Proveedores',
        type: 'bank_transfer',
        status: 'active',
        description: 'Transferencias interbancarias directas a proveedores recurrentes.',
        createdAt: '2026-06-25T11:45:00.000Z'
      }
    ];

    seedPayments.forEach((p) => paymentStore.put(p));
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(username);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Error al buscar el usuario.'));
    });
  }

  public async saveUser(user: User): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al registrar el usuario.'));
    });
  }

  public async getPayments(): Promise<PaymentMethod[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('payments', 'readonly');
      const store = transaction.objectStore('payments');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error('Error al cargar métodos de pago.'));
    });
  }

  public async getPayment(id: string): Promise<PaymentMethod | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('payments', 'readonly');
      const store = transaction.objectStore('payments');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Error al cargar el método de pago.'));
    });
  }

  public async savePayment(payment: PaymentMethod): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('payments', 'readwrite');
      const store = transaction.objectStore('payments');
      const request = store.put(payment);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al guardar el método de pago.'));
    });
  }

  public async deletePayment(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('payments', 'readwrite');
      const store = transaction.objectStore('payments');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al eliminar el método de pago.'));
    });
  }
}

export const dbService = new IndexedDBService();

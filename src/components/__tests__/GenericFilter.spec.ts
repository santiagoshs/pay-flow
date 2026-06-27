import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import GenericFilter from '../GenericFilter.vue';
import type { FilterField } from '../../types';

const mockNotify = vi.fn();
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
  }),
}));

interface GenericFilterInstance {
  filterValues: Record<string, string>;
}

describe('GenericFilter.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fields: FilterField[] = [
    { key: 'name', label: 'Nombre', type: 'text', required: false },
    { key: 'type', label: 'Tipo', type: 'select', required: true, options: [{ label: 'Card', value: 'card' }] },
  ];

  const mountOptions = {
    props: { fields },
    global: {
      stubs: {
        'q-card': { template: '<div class="q-card"><slot /></div>' },
        'q-input': {
          props: ['modelValue', 'label', 'error', 'errorMessage'],
          template: '<div class="q-input" :label="label"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>'
        },
        'q-select': {
          props: ['modelValue', 'label', 'error', 'errorMessage', 'options'],
          template: '<div class="q-select" :label="label"><select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select></div>'
        },
        'q-btn': {
          props: ['label', 'loading'],
          template: '<button class="q-btn" type="button" @click="$emit(\'click\')">{{ label }}</button>'
        }
      }
    }
  };

  it('renders fields based on configuration', () => {
    const wrapper = mount(GenericFilter, mountOptions);

    expect(wrapper.html()).toContain('label="Nombre"');
    expect(wrapper.html()).toContain('label="Tipo"');
  });

  it('validates required fields and shows notification', async () => {
    const wrapper = mount(GenericFilter, mountOptions);

    const buttons = wrapper.findAll('button');
    const searchBtn = buttons.find(b => b.text().includes('Buscar'));
    expect(searchBtn).toBeDefined();

    await searchBtn!.trigger('click');

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'negative',
        message: 'Por favor complete los campos obligatorios del filtro.',
      })
    );

    expect(wrapper.emitted('search')).toBeUndefined();
  });

  it('excludes empty fields from emitted search payload', async () => {
    const wrapper = mount(GenericFilter, mountOptions);

    const vm = wrapper.vm as unknown as GenericFilterInstance;
    vm.filterValues.name = 'visa';
    vm.filterValues.type = 'card';

    const buttons = wrapper.findAll('button');
    const searchBtn = buttons.find(b => b.text().includes('Buscar'));
    await searchBtn!.trigger('click');

    const searchEvents = wrapper.emitted('search');
    expect(searchEvents).toBeDefined();
    expect(searchEvents?.[0]?.[0]).toEqual({
      name: 'visa',
      type: 'card',
    });
  });

  it('clears all values on clicking clear button', async () => {
    const wrapper = mount(GenericFilter, mountOptions);

    const vm = wrapper.vm as unknown as GenericFilterInstance;
    vm.filterValues.name = 'visa';
    vm.filterValues.type = 'card';

    const buttons = wrapper.findAll('button');
    const clearBtn = buttons.find(b => b.text().includes('Limpiar'));
    await clearBtn!.trigger('click');

    expect(vm.filterValues.name).toBe('');
    expect(vm.filterValues.type).toBe('');

    expect(wrapper.emitted('clear')).toBeDefined();
    const searchEvents = wrapper.emitted('search');
    expect(searchEvents).toBeDefined();
    expect(searchEvents?.[0]?.[0]).toEqual({});
  });
});

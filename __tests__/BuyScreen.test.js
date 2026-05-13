import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import BuyScreen from '../src/screens/BuyScreen/component';

jest.mock('../src/utils/analytics', () => ({
  registerEventScreenMounted: jest.fn(),
}));

const expenseTypeOptions = [
  { label: 'Arriendo', value: 1 },
  { label: 'Servicios', value: 2 },
  { label: 'Compra de productos', value: 50 },
];

const paymentOptions = [
  { label: 'Efectivo', value: 7 },
  { label: 'Tarjeta', value: 8 },
];

function buildProps(overrides = {}) {
  const actions = {
    getFieldsInfo: jest.fn(),
    clearScreen: jest.fn(),
    expenseTypeChange: jest.fn(),
    paymentChange: jest.fn(),
    valueChange: jest.fn(),
    obsChange: jest.fn(),
    addProduct: jest.fn(),
    removeProduct: jest.fn(),
    deleteProduct: jest.fn(),
    qtyChange: jest.fn(),
    priceChange: jest.fn(),
    createPurchase: jest.fn(),
    login: jest.fn(),
  };
  return {
    user: { uid: 1, company: 1, features: [], cash_id: 0 },
    expenseType: expenseTypeOptions,
    paymentsType: paymentOptions,
    expense: null,
    payment: null,
    provider: null,
    value: '',
    obs: '',
    product: [],
    errors: [],
    navigation: { navigate: jest.fn() },
    actions,
    ...overrides,
  };
}

describe('BuyScreen (Nuevo gasto)', () => {
  it('al montar pide la info de campos', () => {
    const props = buildProps();
    render(<BuyScreen {...props} />);
    expect(props.actions.getFieldsInfo).toHaveBeenCalledWith(1);
  });

  it('renderiza los selects de Tipo de gasto y pago', () => {
    render(<BuyScreen {...buildProps()} />);
    expect(screen.getAllByText('Tipo de gasto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('pago').length).toBeGreaterThan(0);
  });

  it('seleccionar un tipo de gasto dispatcha expenseTypeChange', () => {
    const props = buildProps();
    render(<BuyScreen {...props} />);
    fireEvent.press(screen.getByText('Arriendo'));
    expect(props.actions.expenseTypeChange).toHaveBeenCalledWith({
      label: 'Arriendo',
      value: 1,
    });
  });

  it('seleccionar pago Efectivo dispatcha paymentChange', () => {
    const props = buildProps();
    render(<BuyScreen {...props} />);
    fireEvent.press(screen.getByText('Efectivo'));
    expect(props.actions.paymentChange).toHaveBeenCalledWith({
      label: 'Efectivo',
      value: 7,
    });
  });

  it('con expense="Arriendo" muestra input Valor unitario', () => {
    const props = buildProps({
      expense: { label: 'Arriendo', value: 1 },
    });
    render(<BuyScreen {...props} />);
    expect(screen.getAllByText('Valor unitario').length).toBeGreaterThan(0);
  });

  it('con expense="Compra de productos" muestra Proveedor en lugar del Valor', () => {
    const props = buildProps({
      expense: { label: 'Compra de productos', value: 50 },
    });
    render(<BuyScreen {...props} />);
    expect(screen.getAllByText('Proveedor').length).toBeGreaterThan(0);
    expect(screen.queryByText('Valor unitario')).toBeNull();
  });

  it('cambiar el valor dispatcha valueChange con el numero', () => {
    const props = buildProps({
      expense: { label: 'Arriendo', value: 1 },
    });
    render(<BuyScreen {...props} />);
    const inputs = screen.UNSAFE_getAllByProps({ placeholder: 'Valor unitario' });
    fireEvent.changeText(inputs[0], '50000');
    expect(props.actions.valueChange).toHaveBeenCalledWith('50000');
  });

  it('tap en Enviar dispatcha createPurchase con uid y navigation', () => {
    const props = buildProps({
      expense: { label: 'Arriendo', value: 1 },
      payment: { label: 'Efectivo', value: 7 },
      value: '50000',
    });
    render(<BuyScreen {...props} />);
    fireEvent.press(screen.getByText('Enviar'));
    expect(props.actions.createPurchase).toHaveBeenCalledWith({
      uid: 1,
      navigation: props.navigation,
    });
  });

  it('si cash_management_required y cash_id=0 NO muestra el form, ofrece Abrir caja', () => {
    const props = buildProps({
      user: {
        uid: 1,
        company: 1,
        features: ['cash_management_required'],
        cash_id: 0,
      },
    });
    render(<BuyScreen {...props} />);
    expect(screen.getByText('Aún no puedes registrar gastos')).toBeTruthy();
    expect(screen.getByText('Abrir caja')).toBeTruthy();
    expect(screen.queryByText('Enviar')).toBeNull();
  });

  it('si cash_management_required y cash_id>0 SI muestra el form', () => {
    const props = buildProps({
      user: {
        uid: 1,
        company: 1,
        features: ['cash_management_required'],
        cash_id: 99,
      },
    });
    render(<BuyScreen {...props} />);
    expect(screen.getByText('Enviar')).toBeTruthy();
  });
});

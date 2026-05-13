import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import SelectList from '../src/components/selectList';

describe('SelectList', () => {
  const variables = [
    { label: 'Arriendo', value: 1 },
    { label: 'Servicios', value: 2 },
    { label: 'Compra de productos', value: 50 },
  ];

  it('renders label when value is empty', () => {
    render(<SelectList label="Tipo de gasto" variables={variables} onValueChange={() => {}} />);
    expect(screen.getAllByText('Tipo de gasto').length).toBeGreaterThan(0);
  });

  it('renders selected value when set', () => {
    render(
      <SelectList
        label="Tipo de gasto"
        value="Arriendo"
        variables={variables}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getAllByText('Arriendo').length).toBeGreaterThan(0);
  });

  it('list of options is rendered inside the bottom sheet', () => {
    render(<SelectList label="Tipo de gasto" variables={variables} onValueChange={() => {}} />);
    expect(screen.getByText('Arriendo')).toBeTruthy();
    expect(screen.getByText('Servicios')).toBeTruthy();
    expect(screen.getByText('Compra de productos')).toBeTruthy();
  });

  it('tapping an option calls onValueChange with the item', () => {
    const onValueChange = jest.fn();
    render(<SelectList label="pago" variables={variables} onValueChange={onValueChange} />);
    fireEvent.press(screen.getByText('Arriendo'));
    expect(onValueChange).toHaveBeenCalledWith({ label: 'Arriendo', value: 1 });
  });

  it('without variables, tap fires onPress (navigation case)', () => {
    const onPress = jest.fn();
    render(<SelectList label="Proveedor" onPress={onPress} />);
    const matches = screen.getAllByText('Proveedor');
    fireEvent.press(matches[matches.length - 1]);
    expect(onPress).toHaveBeenCalled();
  });
});

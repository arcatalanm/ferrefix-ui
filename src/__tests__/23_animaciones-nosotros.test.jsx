import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nosotros from '../pages/Nosotros.jsx';
import { formatearConteo } from '../utils/animaciones';

afterEach(() => cleanup());

describe('formatearConteo', () => {
  test('mantiene el formato de las cifras de Nosotros', () => {
    expect(formatearConteo(12, { prefijo: '+' })).toBe('+12');
    expect(formatearConteo(15000, { prefijo: '+' })).toBe('+15.000');
    expect(formatearConteo(99.4, { decimales: 1, sufijo: '%' })).toBe('99.4%');
    expect(formatearConteo(100, { sufijo: '%' })).toBe('100%');
    expect(formatearConteo(0, { prefijo: '+' })).toBe('+0');
  });
});

describe('Página Nosotros', () => {
  test('muestra las cifras finales y los bloques de contenido', () => {
    render(<MemoryRouter><Nosotros /></MemoryRouter>);
    ['+12', '+15.000', '99.4%', '100%'].forEach((t) => expect(screen.getByText(t)).toBeTruthy());
    expect(screen.getByText('Visítanos en Nuestra Casa Matriz')).toBeTruthy();
  });
});

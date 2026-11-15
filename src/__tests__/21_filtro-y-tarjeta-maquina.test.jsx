import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FiltroBusqueda from '../components/FiltroBusqueda.jsx';
import TarjetaMaquina from '../components/TarjetaMaquina.jsx';

afterEach(() => cleanup());

describe('FiltroBusqueda', () => {
  const propsBase = () => ({
    categorias: { opciones: [{ valor: 'Energía', cantidad: 2 }, { valor: 'Hormigón', cantidad: 1 }], seleccionada: '', onChange: vi.fn() },
    marcas: { opciones: [{ valor: 'Ingco', cantidad: 2 }], seleccionadas: [], onChange: vi.fn() },
    hayFiltros: false,
    onLimpiar: vi.fn(),
  });

  test('al elegir una categoría avisa cuál se eligió', () => {
    const props = propsBase();
    render(<FiltroBusqueda {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Energía/ }));
    expect(props.categorias.onChange).toHaveBeenCalledWith('Energía');
  });

  test('al marcar una marca la agrega a las seleccionadas', () => {
    const props = propsBase();
    render(<FiltroBusqueda {...props} />);
    fireEvent.click(screen.getByLabelText('Ingco'));
    expect(props.marcas.onChange).toHaveBeenCalledWith(['Ingco']);
  });

  test('"Limpiar todo" solo aparece con filtros activos y los reinicia', () => {
    const props = propsBase();
    const { rerender } = render(<FiltroBusqueda {...props} />);
    expect(screen.queryByText('Limpiar todo')).toBeNull();
    rerender(<FiltroBusqueda {...props} hayFiltros />);
    fireEvent.click(screen.getByText('Limpiar todo'));
    expect(props.onLimpiar).toHaveBeenCalled();
  });
});

describe('TarjetaMaquina', () => {
  const maquina = {
    idMaquina: 'MAQ-1', nombre: 'Betonera 150L', marca: 'Ingco', categoria: 'Hormigón', tarifaDia: 18990,
    estado: 'Disponible', incluye: 'Cable industrial', especificaciones: { Motor: '0.75HP' }, imagen: '',
  };
  const renderizar = (m, onArrendar = vi.fn()) => {
    render(<MemoryRouter><TarjetaMaquina maquina={m} onArrendar={onArrendar} /></MemoryRouter>);
    return onArrendar;
  };

  test('muestra los datos y permite arrendar si está disponible', () => {
    const onArrendar = renderizar(maquina);
    expect(screen.getByText('Betonera 150L')).toBeTruthy();
    expect(screen.getByText(/18\.990/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Arrendar' }));
    expect(onArrendar).toHaveBeenCalledWith(maquina);
  });

  test('si está en mantención el botón queda deshabilitado', () => {
    renderizar({ ...maquina, estado: 'Mantención' });
    expect(screen.getByRole('button', { name: 'No disponible' }).disabled).toBe(true);
  });

  test('tiene enlace a la ficha técnica', () => {
    renderizar(maquina);
    expect(screen.getByRole('link', { name: /Ver ficha técnica$/ }).getAttribute('href')).toBe('/arriendos/MAQ-1');
  });
});

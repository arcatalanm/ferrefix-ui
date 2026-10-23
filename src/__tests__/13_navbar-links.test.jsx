// Test: Navbar: muestra los enlaces públicos y de sesión, nunca expone el panel admin en la tienda y sí muestra a los clientes
// Función: Navbar()

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const renderizar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

const guardarSesion = (sesion) => {
  localStorage.setItem('ferrefix_sesion_activa_v1', JSON.stringify(sesion));
};

describe('Componente Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('Navbar: muestra los enlaces públicos y de sesión, nunca expone el panel admin en la tienda y sí muestra a los clientes', () => {
    renderizar();
    expect(screen.getByRole('link', { name: 'Catálogo' }).getAttribute('href')).toBe('/catalogo');
    expect(screen.getByRole('link', { name: 'Arriendos' }).getAttribute('href')).toBe('/arriendos');
    expect(screen.getByRole('link', { name: 'Nosotros' }).getAttribute('href')).toBe('/nosotros');
    expect(screen.getByRole('link', { name: 'Cotizaciones' }).getAttribute('href')).toBe('/contacto');
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' }).getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: 'Registrarse' }).getAttribute('href')).toBe('/registro');

    expect(screen.queryByText('Panel Administrativo')).toBeNull();
    expect(screen.queryByText('Cerrar Sesión')).toBeNull();
    cleanup();

    // Aunque exista una sesión de admin guardada, el navbar de la tienda la
    // oculta: esa sesión solo es válida dentro de /admin.
    guardarSesion({
      idUsuario: 'USR-001',
      nombre: 'Administrador Ferrefix',
      email: 'admin@ferrefix.cl',
      rol: 'admin'
    });
    renderizar();
    expect(screen.queryByText('Panel Administrativo')).toBeNull();
    expect(screen.queryByText('Cerrar Sesión')).toBeNull();
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeTruthy();
    cleanup();

    // Un cliente sí debe ver su sesión en el navbar.
    guardarSesion({
      idUsuario: 'USR-003',
      nombre: 'Juan Maestro',
      email: 'cliente@ferrefix.cl',
      rol: 'cliente'
    });
    renderizar();
    expect(screen.getByTitle('Conectado como Juan Maestro')).toBeTruthy();
    expect(screen.getByText('Cerrar Sesión')).toBeTruthy();
    expect(screen.queryByText('Panel Administrativo')).toBeNull();
  });
});

import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import EditorTiptap from '../components/EditorTiptap';

afterEach(cleanup);

test('la barra aplica alineación y formato al contenido', () => {
  const onChange = vi.fn();
  render(<EditorTiptap value="<p>Ficha del equipo</p>" onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Centrar', exact: true }));
  expect(onChange.mock.calls.at(-1)[0]).toContain('text-align: center');
  expect(screen.getByRole('button', { name: 'Centrar', exact: true }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.change(screen.getByLabelText('Formato de párrafo'), { target: { value: 'h2' } });
  expect(onChange.mock.calls.at(-1)[0]).toContain('<h2');
});

test('bloquea la edición y las herramientas mientras se guarda', () => {
  render(<EditorTiptap value="<p>Contenido</p>" disabled onSubirImagen={vi.fn()} />);
  expect(screen.getByRole('textbox').getAttribute('contenteditable')).toBe('false');
  for (const button of screen.getAllByRole('button')) expect(button.disabled).toBe(true);
});

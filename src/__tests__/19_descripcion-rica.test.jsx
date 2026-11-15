import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DescripcionProducto from '../components/DescripcionProducto';

const html = (texto) => render(<DescripcionProducto texto={texto} />).container.innerHTML;

describe('DescripcionProducto: sanitización', () => {
  it('elimina scripts, handlers y javascript:', () => {
    const sucio = '<p onclick="x()">hola</p><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">l</a><iframe src="//evil"></iframe><svg onload="alert(1)"></svg><p style="position:fixed">s</p><form action="//evil"><input></form>';
    const r = html(sucio);
    expect(r).not.toMatch(/<script|onerror|onclick|onload|javascript:|<iframe|<svg|style=|<form|<input/i);
  });
  it('fuerza rel seguro en enlaces con target', () => {
    const r = html('<p><a href="https://x.cl" target="_blank">x</a></p>');
    expect(r).toMatch(/rel="noopener noreferrer"/);
  });
  it('conserva el formato legítimo', () => {
    const r = html('<h2>T</h2><p><strong>a</strong> <em>b</em></p><ul><li>c</li></ul><img src="/media/x.webp" alt="d">');
    expect(r).toMatch(/<h2>T<\/h2>/); expect(r).toMatch(/<strong>a<\/strong>/); expect(r).toMatch(/<li>c<\/li>/); expect(r).toMatch(/<img/);
  });
  it('texto plano heredado no se interpreta como HTML', () => {
    expect(html('Cemento <b>x')).toMatch(/Cemento/);
  });
});

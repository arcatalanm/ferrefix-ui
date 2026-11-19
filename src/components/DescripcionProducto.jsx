import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { esHtml } from '../utils/descripcionRica';

// Solo lo que genera el editor Tiptap (StarterKit + Link + Image). Todo lo demás se descarta.
const CONFIG_SANITIZADO = {
  ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'strong', 'em', 'u', 's', 'blockquote', 'pre', 'code', 'hr', 'ul', 'ol', 'li', 'a', 'img'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'style'],
  ALLOW_DATA_ATTR: false,
  // Solo http(s), mailto, tel y rutas relativas.
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i,
};

const purificador = DOMPurify(typeof window !== 'undefined' ? window : undefined);
purificador.addHook('afterSanitizeAttributes', (nodo) => {
  if (nodo.hasAttribute?.('style')) {
    const alineacion = nodo.style.textAlign;
    nodo.removeAttribute('style');
    if (['P', 'H1', 'H2', 'H3'].includes(nodo.tagName) && ['left', 'center', 'right', 'justify'].includes(alineacion)) nodo.style.textAlign = alineacion;
  }
  if (nodo.tagName === 'A' && nodo.hasAttribute('href')) {
    nodo.setAttribute('rel', 'noopener noreferrer');
    if (nodo.hasAttribute('target')) nodo.setAttribute('target', '_blank');
  }
});

const sanitizarDescripcion = (html) => purificador.sanitize(html, CONFIG_SANITIZADO);

// Muestra la descripción: HTML enriquecido (sanitizado) o texto plano heredado.
export default function DescripcionProducto({ texto, vacio = 'No hay una descripción adicional disponible.' }) {
  const limpio = useMemo(() => (texto && esHtml(texto) ? sanitizarDescripcion(texto) : null), [texto]);

  if (!texto) return <p className="marca-parrafo detalle-texto mb-0">{vacio}</p>;
  if (limpio === null) return <p className="marca-parrafo detalle-texto mb-0">{texto}</p>;
  return <div className="descripcion-rica" dangerouslySetInnerHTML={{ __html: limpio }} />;
}

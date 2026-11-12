import { useEffect } from 'react';
export function useAccessibleDialogs() {
  useEffect(() => {
    let actual; let anterior; let originalOverflow;
    const enfocable = () => [...actual.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(e => e.getClientRects().length);
    const actualizar = () => {
      const modal = document.querySelector('.modal.show');
      if (modal === actual) return;
      if (actual) { document.body.style.overflow = originalOverflow; anterior?.focus?.({ preventScroll: true }); }
      actual = modal;
      if (!actual) return;
      anterior = document.activeElement; originalOverflow = document.body.style.overflow;
      actual.setAttribute('role', 'dialog'); actual.setAttribute('aria-modal', 'true');
      const title = actual.querySelector('h2,h3,h4,h5,.modal-title');
      if (title) { title.id ||= 'dialogo-titulo'; actual.setAttribute('aria-labelledby', title.id); }
      document.body.style.overflow = 'hidden';
      (enfocable()[0] || actual).focus();
    };
    const teclado = event => {
      if (!actual) return;
      if (event.key === 'Escape') { event.preventDefault(); actual.querySelector('.btn-close, [data-dialog-close]')?.click(); }
      if (event.key === 'Tab') {
        const campos = enfocable(); const first = campos[0]; const last = campos.at(-1);
        if (!first) { event.preventDefault(); actual.focus(); }
        else if (event.shiftKey && (!actual.contains(document.activeElement) || document.activeElement === first)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (!actual.contains(document.activeElement) || document.activeElement === last)) { event.preventDefault(); first.focus(); }
      }
    };
    const observer = new MutationObserver(actualizar);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', teclado); actualizar();
    return () => { observer.disconnect(); document.removeEventListener('keydown', teclado); if (actual) document.body.style.overflow = originalOverflow; };
  }, []);
}

export const esHtml = (texto) => /<\/?(p|h[1-6]|ul|ol|li|strong|em|a|img|br)\b/i.test(texto || '');

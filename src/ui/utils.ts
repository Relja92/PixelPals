export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getGifUrl(petType: string, color?: string, action: string = 'idle'): string {
  const actionFile = action === 'idle' ? 'idle_8fps.gif' : `${action}_8fps.gif`;
  return `/assets/${petType}/${color}_${actionFile}`;
}

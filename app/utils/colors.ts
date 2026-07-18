// Liefert eine gut lesbare Textfarbe für einen gegebenen Hex-Hintergrund
export function contrastTextColor(hex: string): string {
    const value = hex.replace('#', '');
    if (value.length !== 6) return '#FFFDFB';

    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.55 ? '#161210' : '#FFFDFB';
}

// Caixa de colisão retangular em pixels lógicos. Usada por todas as entidades.
export interface Caixa {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export function sobrepoe(a: Caixa, b: Caixa): boolean {
  return (
    a.x < b.x + b.largura &&
    b.x < a.x + a.largura &&
    a.y < b.y + b.altura &&
    b.y < a.y + a.altura
  );
}

export function roll(expr: string): { total: number; parts: number[] } {
    // Ultra simple: support "XdY+Z"
    const m = expr.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!m) throw new Error("bad_dice_expr");
    const [_, xStr, yStr, modStr] = m;
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);
    const mod = modStr ? parseInt(modStr, 10) : 0;
  
    const parts: number[] = [];
    for (let i = 0; i < x; i++) {
      parts.push(1 + Math.floor(Math.random() * y));
    }
    const total = parts.reduce((a, b) => a + b, 0) + mod;
    return { total, parts };
  }
  
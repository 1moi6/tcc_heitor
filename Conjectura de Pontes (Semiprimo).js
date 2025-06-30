const fs = require("fs");

// --- Miller-Rabin para testar primalidade ---
function modPow(base, exponent, mod) {
  let result = 1n;
  base = base % mod;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exponent /= 2n;
  }
  return result;
}

function millerRabin(n, k = 5) {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  let r = 0n, d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n];
  for (let i = 0; i < k; i++) {
    const a = bases[i % bases.length];
    if (a >= n - 2n) continue;

    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let continueLoop = false;
    for (let j = 0n; j < r - 1n; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        continueLoop = true;
        break;
      }
    }
    if (continueLoop) continue;
    return false;
  }
  return true;
}

function isPrime(n) {
  return millerRabin(n);
}

// --- Raiz quadrada inteira para BigInt ---
function sqrtBigInt(value) {
  if (value < 0n) throw new Error('negative number');
  if (value < 2n) return value;
  let left = 1n, right = value;
  while (left <= right) {
    const mid = (left + right) >> 1n;
    const sq = mid * mid;
    if (sq === value) return mid;
    else if (sq < value) left = mid + 1n;
    else right = mid - 1n;
  }
  return right;
}

// --- Trial division otimizada para encontrar fatores ---
function getPrimeFactors(n) {
  const factors = [];
  const MAX_LIMIT = 1000000n;
  let limit = sqrtBigInt(n);
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  let d = 2n;
  while (d <= limit && d * d <= n) {
    while (n % d === 0n) {
      factors.push(d);
      n /= d;
      limit = sqrtBigInt(n);
      if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    }
    d = d === 2n ? 3n : d + 2n;
  }
  if (n > 1n) factors.push(n);
  return factors;
}

// --- Verifica se número é semiprimo ---
function isSemiprime(n) {
  if (n < 4n) return false; // mínimo semiprimo = 4 = 2*2
  if (isPrime(n)) return false; // primo não é semiprimo

  const factors = getPrimeFactors(n);
  if (factors.length !== 2) return false;
  return isPrime(factors[0]) && isPrime(factors[1]);
}

// --- Função para gerar expoentes customizados ---
function generateCustomExponents(limit) {
  const exponents = [3, 5, 8];
  let current = 2;
  const exceptions = new Set([16]);
  let pow = 16;

  while (pow <= limit) {
    exceptions.add(pow);
    pow = 2 ** pow;
    if (pow > limit) break;
  }

  while (true) {
    const next = 8 * current;
    const nextE = exceptions.has(next) ? next + 1 : next;
    if (next > limit) break;

    exponents.push(next);
    if (nextE < limit && next !== nextE) exponents.push(nextE);
    current++;
  }

  return exponents;
}

// --- Verificar semiprimos nos valores gerados ---
function verificarSemiprimos(f) {
  const fibExponents = generateCustomExponents(f + 1);
  const offsets = [0n];
  let ContNP = 0;
  fibExponents.forEach(e => {
    const power = 1n << BigInt(e);
    offsets.push(power);
    offsets.push(-power);
  });

  const xValues = [2n * BigInt(f) - 1n, 2n * BigInt(f)];

  xValues.forEach(x => {
    const sumPart = (1n << BigInt(f + 1)) - 1n;
    const subtractPart = (x % 2n) * (1n << BigInt(f - 1));
    const baseResult = sumPart - subtractPart;

    console.log(`\n🔹 x = ${x} → base = 2^${f + 1} - 1 ${x % 2n === 1n ? `- 2^${f - 1}` : ''}`);

    for (const offset of offsets) {
      const val = baseResult + offset;
      if (val < 2n) continue;

      if (isSemiprime(val)) {
        const factors = getPrimeFactors(val);
        const offsetExp = Math.log2(Number(offset < 0n ? -offset : offset));
        ContNP += 1;

        console.log(`✅ Semiprimo encontrado!`);
        console.log(`   Fórmula base: 2^${f + 1} - 1 ${x % 2n === 1n ? `- 2^${f - 1}` : ''}`);
        console.log(`   Offset: ${offset >= 0n ? '+' : '-'}2^${offsetExp}`);
        console.log(`   Número: ${val}`);
        console.log(`   Fatores: ${factors[0]} × ${factors[1]}`);
        console.log(`---------------------------------------------`);
      }
    }
  });
  console.log(`\n Foram encontrados ${ContNP} números semiprimos`)
}

// 👇 Altere para o valor de f que falhou
verificarSemiprimos(523);
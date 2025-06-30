// Exponenciação modular: (base^exp) % mod
function modPow(base, exp, mod) {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

// Miller-Rabin para verificação probabilística de primalidade
function isBigPrime(n, k = 10) {
  if (n === 2n || n === 3n) return true;
  if (n < 2n || n % 2n === 0n) return false;

  let r = 0n;
  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    r += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n];
  for (let i = 0; i < k && i < bases.length; i++) {
    const a = bases[i];
    if (a >= n - 2n) continue;

    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let passed = false;
    for (let j = 0n; j < r - 1n; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        passed = true;
        break;
      }
    }
    if (!passed) return false;
  }

  return true;
}

// Gera a lista de expoentes da sequência personalizada
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

// Verificação principal para um único f
function checkF(f) {
  const fibExponents = generateCustomExponents(f + 1);
  const offsets = [0n];
  fibExponents.forEach(e => {
    const power = 1n << BigInt(e);
    offsets.push(power);
    if (power !== 0n) offsets.push(-power);
  });

  const xValues = [2n * BigInt(f) - 1n, 2n * BigInt(f)];
  let algumPrimo = false;

  console.log(`\n===============================\nf = ${f}`);
  console.log(`x possíveis: ${xValues.join(', ')}`);
  console.log(`Offsets (${offsets.length}):`, offsets.map(String));

  xValues.forEach(x => {
    const sumPart = (1n << BigInt(f + 1)) - 1n;
    const subtractPart = (x % 2n) * (1n << BigInt(f - 1));
    const baseResult = sumPart - subtractPart;

    console.log(`\n🔹 x = ${x}, base result = ${baseResult}`);

    let primoLocal = false;
    for (const offset of offsets) {
      const testVal = baseResult + offset;
      if (isBigPrime(testVal)) {
        console.log(`✅ Primo encontrado: ${testVal} (offset ${offset >= 0n ? '+' : ''}${offset})`);
        primoLocal = true;
        algumPrimo = true;
        break;
      }
    }

    if (!primoLocal) {
      console.log("❌ Nenhum primo encontrado com offsets permitidos. Testando combinações...");
      
    }
  });

  if (!algumPrimo) {
    console.log(`\n🔴 Nenhum primo encontrado para f = ${f}`);
  }
  return algumPrimo;
}

// Lista de primos a testar (exemplo)
const primos = [11];
let quebrapad = false;
const quebraVal = [];

primos.forEach(p => {
  console.log(`\n\n### Analisando f = ${p - 1} e f = ${p} ###`);
  const r1 = checkF(p - 1);
  const r2 = checkF(p);

  if (!r1 && !r2) {
    quebrapad = true;
    quebraVal.push(p);
    console.log(`\n❗ Quebra de padrão detectada em p = ${p}. Nenhum primo encontrado para f = ${p - 1} e f = ${p}.`);
  }
});

if (!quebrapad) {
  console.log(`\n✅ Nenhuma quebra de padrão detectada nos valores analisados.`);
} else {
  console.log(`\n❗ Quebra de padrão detectada em p = ${quebraVal}. Nenhum primo encontrado para f = p - 1 e f = p.`);
}
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
  //console.log(`Offsets `, offsets.map(String));

  xValues.forEach(x => {
    const sumPart = (1n << BigInt(f + 1)) - 1n;
    const subtractPart = (x % 2n) * (1n << BigInt(f - 1));
    const baseResult = sumPart - subtractPart;

    console.log(`\n🔹 x = ${x}, base result = ${baseResult}`);

    let primoLocal = false;
    // for (const offset of offsets) {
      const testVal = baseResult // + offset;
      if (isBigPrime(testVal)) {
        console.log(`✅ Primo encontrado: ${testVal} `);//(offset ${offset >= 0n ? '+' : ''}${offset})`);
        primoLocal = true;
        algumPrimo = true;
        //break;
      }
    //}

    if (!primoLocal) {
      console.log("❌ Nenhum primo encontrado com offsets permitidos.");
    }
  });

  if (!algumPrimo) {
    console.log(`\n🔴 Nenhum primo encontrado para f = ${f}`);
  }
  return algumPrimo;
}

// Lista de primos a testar (exemplo)
const primos = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991];
let quebrapad = false;
const quebraVal = [];
const ValFind = [];

primos.forEach(p => {
  console.log(`\n\n### Analisando f = ${p} ###`);
  const Altera = generateCustomExponents(p);
  Altera.push(0);
  Altera.sort();

  let quebralocal = true;
  for (const V of Altera) {
    const r1 = checkF(p + V);
    const r2 = checkF(p - V);

    if (r1 || r2) {
      quebralocal = false;
      if (r1) ValFind.push(`${p + V}(${p} + ${V})`); else ValFind.push(`${p - V}(${p} - ${V})`)
      //if (r2) ValFind.push(`${p - V}(${p} - ${V})`);
      break;
    }
  }
  if (quebralocal){
    quebraVal.push(p);
    quebrapad = true;
    //console.log(`\n❗ Quebra de padrão detectada em p = ${p}. Nenhum primo encontrado dentro do offset.`);
  }
});

if (!quebrapad) {
  console.log(`\n✅ Nenhuma quebra de padrão detectada nos valores analisados.`);
} else {
  console.log(`\n❗ Quebra de padrão detectada em p = ${quebraVal}. Nenhum primo encontrado.`);
}
console.log(`Quantidade de números analisados: `, primos.length)
console.log(`Valores de f: `, ValFind.map(String));
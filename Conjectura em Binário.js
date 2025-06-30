const fs = require("fs");

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

function gerarCSVBits(f) {
  const fibExponents = generateCustomExponents(f + 1);
  const offsets = [0n];

  fibExponents.forEach(e => {
    const power = 1n << BigInt(e);
    offsets.push(power);
    if (power !== 0n) offsets.push(-power);
  });

  const xValues = [2n * BigInt(f) - 1n, 2n * BigInt(f)];
  const resultados = [];

  xValues.forEach(x => {
    const sumPart = (1n << BigInt(f + 1)) - 1n;
    const subtractPart = (x % 2n) * (1n << BigInt(f - 1));
    const baseResult = sumPart - subtractPart;

    offsets.forEach(offset => {
      const val = baseResult + offset;
      resultados.push(val);
    });
  });

  resultados.sort((a, b) => (a < b ? -1 : 1));
  const maxLen = Math.max(...resultados.map(v => v.toString(2).length));

  const linhas = [];

  // Linha 1: em branco
  linhas.push(",");

  // Linha 2: "decimal", seguido dos valores decimais
  const linhaDecimal = ["decimal", ...resultados.map(v => v.toString())];
  linhas.push(linhaDecimal.join(","));

  // Demais linhas: número decimal + bits
  for (const val of resultados) {
    const bin = val.toString(2).padStart(maxLen, "0");
    
    
    // Número decimal em texto
    const decimalStr = val.toString();

    // Binário invertido (direita pra esquerda)
    let binBits = bin.split("").reverse();

    // Substituir o primeiro bit por "-"
    binBits[0] = "-";

    // Repetir bits cíclicamente para preencher o total
    while (binBits.length < maxLen) {
    binBits.push(binBits[(binBits.length - (maxLen % binBits.length)) % binBits.length]);
    }

    // Monta a linha: decimal + bits
    const linha = [decimalStr, ...binBits];


    
    linhas.push(linha.join(","));
  }

  const filename = `binarios_f${f}.csv`;
  fs.writeFileSync(filename, linhas.join("\n"));
  console.log(`✅ CSV gerado: ${filename}`);
}

// Altere aqui o valor de f desejado
gerarCSVBits(499);
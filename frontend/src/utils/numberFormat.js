function formatarNumeroBR(numero, profile) {
  if (!numero || numero.length < 12 || numero.length > 14) return numero; // formato inválido

  const pais = numero.slice(0, 2); // sempre 55
  const ddd = numero.slice(2, 4);
  const restante = numero.slice(4);

  let formatted;

  // Se não for admin, mascara parte do número
  if (profile !== 'admin') {
    // +55 (63) 9****-0032
    formatted = `+${pais} (${ddd}) ${restante[0]}••••-${restante.slice(-4)}`;
  } else {
    // +55 (63) **00-0032
    formatted = `+${pais} (${ddd}) ${restante.slice(0, 4)}-${restante.slice(
      -4
    )}`;
  }

  return formatted;
}

export default formatarNumeroBR;

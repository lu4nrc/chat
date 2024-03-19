const formatarNumeroTelefone = (numero) => {
  // Remove o prefixo "55" caso esteja presente
  const numeroSemPrefixo = numero.startsWith("55") ? numero.slice(2) : numero;

  if (numeroSemPrefixo.length < 11) {
    // Formata o número no padrão (XX) XXXX-XXXX
    const parte1 = numeroSemPrefixo.slice(0, 2);
    const parte2 = numeroSemPrefixo.slice(2, 6);
    const parte3 = numeroSemPrefixo.slice(6);

    return `(${parte1}) ${parte2}-${parte3}`;
  } else {
    // Formata o número no padrão (XX) XXXXX-XXXX
    const parte1 = numeroSemPrefixo.slice(0, 2);
    const parte2 = numeroSemPrefixo.slice(2, 3);
    const parte3 = numeroSemPrefixo.slice(3, 7);
    const parte4 = numeroSemPrefixo.slice(7);

    return `(${parte1}) ${parte2} ${parte3}-${parte4}`;
  }
};

export default formatarNumeroTelefone;

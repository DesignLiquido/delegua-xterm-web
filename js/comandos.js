window.comandos = {
  help: {
    f: () => {
      const padding = 10;
      function formatMessage(name, description) {
        const maxLength = term.cols - padding - 3;
        let remaining = description;
        const d = [];
        while (remaining.length > 0) {
          // Remover espaços deixados pela linha anterior
          remaining = remaining.trimStart();
          // Verificar se o texto restante cabe
          if (remaining.length < maxLength) {
            d.push(remaining);
            remaining = "";
          } else {
            let splitIndex = -1;
            // Verificar se a linha restante já quebra
            if (remaining[maxLength] === " ") {
              splitIndex = maxLength;
            } else {
              // Encontrar o último espaço para usar como índice de divisão
              for (let i = maxLength - 1; i >= 0; i--) {
                if (remaining[i] === " ") {
                  splitIndex = i;
                  break;
                }
              }
            }
            d.push(remaining.substring(0, splitIndex));
            remaining = remaining.substring(splitIndex);
          }
        }
        const message =
          `  \x1b[36;1m${name.padEnd(padding)}\x1b[0m ${d[0]}` +
          d.slice(1).map((e) => `\r\n  ${" ".repeat(padding)} ${e}`);
        return message;
      }
      term.writeln(
        [
          "Nossas boas-vindas à simulação de terminal Delégua na Web! Experimente alguns dos comandos abaixo.",
          "",
          ...Object.keys(commands).map((e) =>
            formatMessage(e, commands[e].description)
          ),
        ].join("\n\r")
      );
      prompt(term);
    },
    description: "Imprime esta mensagem de ajuda.",
  }
};

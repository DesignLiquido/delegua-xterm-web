const delegua = window.Delegua;

const lexador = new delegua.Lexador();
const avaliadorSintatico = new delegua.AvaliadorSintatico();
const interpretador = new delegua.InterpretadorBase('', false, console.log, console.log);

window.executarInstrucaoDelegua = async (terminal, linha) => {
    const resultadoLexador = lexador.mapear([linha], -1);
    const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador);
    const retornoInterpretador = await interpretador.interpretar(
        resultadoAvaliacaoSintatica.declaracoes,
        false
    );
}
'use strict';

const { Interpretador, DeleguaModulo, FuncaoPadrao, Lexador, AvaliadorSintatico } = require('@designliquido/delegua');
const { ErroEmTempoDeExecucao } = require('@designliquido/delegua/excecoes');

const criptografia = require('@designliquido/delegua-criptografia');
const estatistica = require('@designliquido/delegua-estatistica');
const fisica = require('@designliquido/delegua-fisica');
const json = require('@designliquido/delegua-json/web');
const matematica = require('@designliquido/delegua-matematica');
const tempo = require('@designliquido/delegua-tempo');
const { ObjetoData } = require('@designliquido/delegua-tempo/objeto-data');
const NOMES_BIBLIOTECAS = ['criptografia', 'estatistica', 'fisica', 'json', 'matematica', 'tempo'];

function extrairNomeTopico(elemento) {
    if (!elemento) return null;
    if (elemento.simbolo && elemento.simbolo.lexema) return elemento.simbolo.lexema;
    if (elemento.valor !== undefined && typeof elemento.valor === 'string') return elemento.valor;
    if (elemento.lexema) return elemento.lexema;
    return null;
}

class InterpretadorComBibliotecas extends Interpretador {
    constructor(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
    }

    async _resolverImporte(caminho, linha) {
        if (NOMES_BIBLIOTECAS.includes(caminho)) {
            const variavel = this.pilhaEscoposExecucao.obterVariavelPorNome(caminho);
            return Promise.resolve(variavel.valor);
        }
        throw new ErroEmTempoDeExecucao(
            { hashArquivo: -1, linha },
            `Biblioteca '${caminho}' não está disponível neste terminal Web.`,
            linha
        );
    }

    async visitarDeclaracaoImportar(declaracao) {
        return this._resolverImporte(declaracao.caminho.valor, declaracao.linha);
    }

    async visitarExpressaoImportar(expressao) {
        return this._resolverImporte(expressao.caminho.valor, expressao.linha);
    }

    async visitarDeclaracaoAjuda(declaracao) {
        if (declaracao.funcao && declaracao.elemento) {
            const nome = extrairNomeTopico(declaracao.elemento);
            return Promise.resolve({ __conteudoAjuda: true, topico: nome || '' });
        }
        return Promise.resolve({ __modoAjuda: true });
    }
}

function montarModulo(moduloDelegua, ...modulosNode) {
    for (const moduloNode of modulosNode) {
        for (const chave of Object.keys(moduloNode)) {
            const fn = moduloNode[chave];
            if (fn && typeof fn === 'function') {
                moduloDelegua.componentes[chave] = new FuncaoPadrao(fn.length, fn);
            }
        }
    }
    return moduloDelegua;
}

function registrarModulo(interpretador, nome, ...mods) {
    const modulo = montarModulo(new DeleguaModulo(nome), ...mods);
    interpretador.pilhaEscoposExecucao.definirVariavel(nome, modulo);
}

function criarInterpretador(funcaoSaida, funcaoSaidaMesmaLinha) {
    const interp = new InterpretadorComBibliotecas('', false, funcaoSaida, funcaoSaidaMesmaLinha);
    registrarModulo(interp, 'criptografia', criptografia);
    registrarModulo(interp, 'estatistica', estatistica);
    registrarModulo(interp, 'fisica', fisica);
    registrarModulo(interp, 'json', json);
    registrarModulo(interp, 'matematica', matematica);
    registrarModulo(interp, 'tempo', tempo, { ObjetoData });
    return interp;
}

module.exports = { Lexador, AvaliadorSintatico, criarInterpretador };

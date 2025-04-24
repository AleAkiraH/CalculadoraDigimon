# Calculadora de Farm Digimon

Uma aplicação web para calcular lucros e gastos em farming do jogo Digimon.

## Características

- Cálculo de gastos de HP, SP e EVP
- Acompanhamento de bits acumulados
- Cronometragem do tempo de farm
- Histórico de sessões
- Gráficos de performance

## Instalação

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/CalculadoraDigimon.git
cd CalculadoraDigimon
```

2. Instale as dependências:
```
npm install
```

3. Execute a aplicação em modo de desenvolvimento:
```
npm run dev
```

4. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## Solução de problemas

Se você encontrar erros relacionados a módulos não encontrados como `chart.js` ou `react-chartjs-2`, execute:

```
npm install chart.js@^4.4.0 react-chartjs-2@^5.2.0
```

## Tecnologias utilizadas

- Next.js
- React
- Chart.js
- react-chartjs-2

## Uso

1. Preencha os valores iniciais e finais de HP, SP, EVP e Bits
2. Defina os preços por unidade de cada consumível
3. Registre o horário de início e fim da sessão
4. Visualize os resultados e gráficos de performance
5. Salve no histórico para acompanhar seu progresso ao longo do tempo

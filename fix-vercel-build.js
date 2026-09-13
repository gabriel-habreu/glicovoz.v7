const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const NOME_ANTIGO = 'node_modules';
const NOME_NOVO = 'external-assets';

// Percorre todas as pastas procurando por uma chamada "node_modules" e renomeia.
function renomearPastas(dir) {
  fs.readdirSync(dir).forEach((item) => {
    const caminhoCompleto = path.join(dir, item);
    if (fs.statSync(caminhoCompleto).isDirectory()) {
      renomearPastas(caminhoCompleto);
      if (item === NOME_ANTIGO) {
        const novoCaminho = path.join(dir, NOME_NOVO);
        fs.cpSync(caminhoCompleto, novoCaminho, { recursive: true });
        fs.rmSync(caminhoCompleto, { recursive: true, force: true });
        console.log(`Renomeado (via copia): ${caminhoCompleto} -> ${novoCaminho}`);
      }
    }
  });
}

// Percorre todos os arquivos de texto (JS, HTML, CSS) corrigindo as referências
// ao caminho antigo, já que o código já foi gerado apontando pro nome velho.
function corrigirReferencias(dir) {
  fs.readdirSync(dir).forEach((item) => {
    const caminhoCompleto = path.join(dir, item);
    if (fs.statSync(caminhoCompleto).isDirectory()) {
      corrigirReferencias(caminhoCompleto);
    } else if (/\.(js|html|css|json)$/.test(item)) {
      let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
      if (conteudo.includes(NOME_ANTIGO)) {
        conteudo = conteudo.split(NOME_ANTIGO).join(NOME_NOVO);
        fs.writeFileSync(caminhoCompleto, conteudo, 'utf8');
        console.log(`Referências corrigidas em: ${caminhoCompleto}`);
      }
    }
  });
}

renomearPastas(distDir);
corrigirReferencias(distDir);

console.log('\nPronto! Agora rode: cd dist && vercel --prod');
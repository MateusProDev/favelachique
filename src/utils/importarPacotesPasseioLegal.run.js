import { importarPacotesPasseioLegal } from './importarPacotesPasseioLegal.js';

importarPacotesPasseioLegal().then((resultado) => {
  console.log(resultado);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

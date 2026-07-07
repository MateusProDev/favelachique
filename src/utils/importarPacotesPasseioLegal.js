import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';

const normalizeSlug = (value = '') => {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const pacotes = [
  {
    titulo: '3 Praias VIP em 1 dia',
    descricaoCurta: 'Passeio com paradas em praias paradisíacas, piscinas naturais e cenários deslumbrantes.',
    descricao: 'Este passeio junta o melhor do passeio de 3 Praias em 1 Dia com o exuberante Caribe do Ceará. Você vai conhecer uma paisagem incrível de encontro do rio com o mar, formando piscinas naturais de águas quentes e tranquilas.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: '3-praias-vip-em-1-dia',
    nomePersonalizado: '3-praias-vip',
    categoria: 'passeio'
  },
  {
    titulo: 'Águas Belas',
    descricaoCurta: 'Praia de águas claras e quentinhas com piscinas naturais e excelente estrutura.',
    descricao: 'Águas Belas é uma praia muito apreciada do litoral leste, com águas claras e quentinhas. Você vai aproveitar as piscinas naturais na praia, ou ainda desfrutar do Rio Malcozinhado se optar pelo passeio opcional de buggy no nosso ponto de apoio, que possui uma excelente estrutura e gastronomia muito elogiada.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'aguas-belas',
    nomePersonalizado: 'aguas-belas',
    categoria: 'passeio'
  },
  {
    titulo: 'Beach Park',
    descricaoCurta: 'Parque aquático de alto padrão com saída de Fortaleza e ótima estrutura.',
    descricao: 'Este passeio tem na modalidade privativo e excursão com saída de Fortaleza às 09:00 e regresso às 17:00 horas. O Beach Park é o maior parque aquático da América Latina e está localizado na cidade de Aquiraz no Ceará, na praia do Porto das Dunas, muito apreciada por sua beleza, segurança, limpeza e tranquilidade.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'beach-park',
    nomePersonalizado: 'beach-park',
    categoria: 'passeio'
  },
  {
    titulo: 'Caribe do Ceará',
    descricaoCurta: 'Passeio com artesanato, rapadura, paisagens e paradas culturais.',
    descricao: 'O passeio oferece paradas no Centro de Artesanato de Aquiraz, onde você poderá ver a maior Renda de Bilro sendo elaborada, e também na Estação Nordestina, onde você encontra a Maior Rapadura do mundo, inclusive com degustação de rapaduras com até 50 sabores variados e cachaças artesanais.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'caribe-do-ceara',
    nomePersonalizado: 'caribe-do-ceara',
    categoria: 'passeio'
  },
  {
    titulo: 'Canoa Quebrada',
    descricaoCurta: 'Praia famosa, mar verde e excelente ponto de apoio com gastronomia regional.',
    descricao: 'Um lugar mágico e de mar verde, Canoa Quebrada é um dos pontos mais visitados do Ceará. A sua beleza que conquistou os europeus é um dos destaques desse passeio. Possui um excelente ponto de apoio, com ótima estrutura e o melhor da culinária regional.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'canoa-quebrada',
    nomePersonalizado: 'canoa-quebrada',
    categoria: 'passeio'
  },
  {
    titulo: 'City Tour',
    descricaoCurta: 'Tour privativo por Fortaleza com praias, museus, teatro e pontos históricos.',
    descricao: 'Nosso City Tour privativo tem uma duração média de 5h, com horário flexível e ajustado de acordo com os seus pontos de interesse. Entre os principais destaques temos a Praia do Futuro, a Catedral Metropolitana, o Centro Cultural Dragão do Mar, o Museu da Cultura Cearense, o Teatro José de Alencar, a Estátua de Iracema, o Mercado dos Peixes e a orla de Fortaleza.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'city-tour',
    nomePersonalizado: 'city-tour',
    categoria: 'passeio'
  },
  {
    titulo: 'Cumbuco',
    descricaoCurta: 'Destino com dunas, lagoas, buggy, tirolesa, jet-ski, banana boat e passeio a cavalo.',
    descricao: 'Point do kitesurf e do surf, Cumbuco também ostenta o título de passeio de buggy mais radical do Ceará, com suas dunas e lagoas fascinantes, onde você poderá curtir atrações como tirolesa, skibunda, jet-ski, banana boat, jangada e passeio à cavalo pela praia (opcionais).',
    preco: 0,
    destaque: true,
    imagens: [],
    slug: 'cumbuco',
    nomePersonalizado: 'cumbuco',
    categoria: 'passeio'
  },
  {
    titulo: 'Flechaú',
    descricaoCurta: 'Passeio privativo com Flecheiras e Mundaú em um roteiro completo.',
    descricao: 'Este passeio está disponível no modo privativo, com saída sugerida entre 7h e 8h da manhã e combina o que há de melhor entre Flecheiras (Piscinas Naturais) e Mundaú (Passeio de Catamarã pelo Rio Mundaú).',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'flechau',
    nomePersonalizado: 'flechau',
    categoria: 'passeio'
  },
  {
    titulo: 'Flecheiras',
    descricaoCurta: 'Praia linda, tranquila, com piscinas naturais e paisagens incomparáveis.',
    descricao: 'Flecheiras é uma praia do litoral oeste do Ceará de beleza sem igual, com águas claras e piscinas naturais que formam uma paisagem incrível. Você vem a Flecheiras e fica encantado com a beleza do lugar, sem dúvida é um cartão postal, onde você pode se desligar de tudo.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'flecheiras',
    nomePersonalizado: 'flecheiras',
    categoria: 'passeio'
  },
  {
    titulo: 'Guaramiranga',
    descricaoCurta: 'Cidade serrana com clima agradável, flores e paisagens encantadoras.',
    descricao: 'Conheça Guaramiranga, a Cidade das Flores! Um roteiro explorando a região do Maciço de Baturité, e essa charmosa cidade, que apresenta um clima agradável, com temperaturas amenas e diversos cenários encantadores, sendo também conhecida como a Suíça Cearense.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'guaramiranga',
    nomePersonalizado: 'guaramiranga',
    categoria: 'passeio'
  },
  {
    titulo: 'Icaraí de Amontada',
    descricaoCurta: 'Praia tranquila e mundialmente conhecida pelos esportes de vento.',
    descricao: 'Icaraizinho, ou Icaraí de Amontada é uma praia linda e tranquila no litoral oeste do Ceará, com localização privilegiada e é conhecida mundialmente por ser um point dos esportes de vento, especialmente do kitesurf e do windsurf.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'icarai-de-amontada',
    nomePersonalizado: 'icarai-de-amontada',
    categoria: 'passeio'
  },
  {
    titulo: 'Icapuí',
    descricaoCurta: 'Praia charmosa, com coqueiros, dunas, mergulho e lagostas.',
    descricao: 'Um dos destinos mais charmosos e exclusivos do litoral Cearense. Que tal aquele mergulho rodeado pelos mais belos e coloridos peixinhos? Encante-se com Icapuí e seus verdes coqueiros, praias, dunas e, lagostas, sim, Icapuí é conhecida como a Terra da Lagosta, devido à sua abundante presença, essa iguaria tem aqui o melhor preço do Ceará.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'icapui',
    nomePersonalizado: 'icapui',
    categoria: 'passeio'
  },
  {
    titulo: 'Jericoacoara',
    descricaoCurta: 'Praia icônica do Ceará com paisagens únicas e forte apelo turístico.',
    descricao: 'Este passeio está disponível na modalidade privativo, com saída à combinar, e excursão com saída às 03:00 da manhã e retorno às 18:00h. Jericoacoara é simplesmente a praia mais visitada e mais bela do Ceará.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'jericoacoara',
    nomePersonalizado: 'jericoacoara',
    categoria: 'passeio'
  },
  {
    titulo: 'Lagoinha',
    descricaoCurta: 'Passeio 3 em 1 com buggy, dunas, lagoas, mirante e catamarã.',
    descricao: 'Você que vem para Lagoinha pode curtir esse passeio que é muito apreciado, o 3 em 1, sendo um trajeto percorrido de buggy pelas dunas, nascentes de água doce, mirante central da praia, além das lagoas do Jegue e das Almécegas, onde começa a etapa no catamarã que tem parada para banho.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'lagoinha',
    nomePersonalizado: 'lagoinha',
    categoria: 'passeio'
  },
  {
    titulo: 'Morro Branco',
    descricaoCurta: 'Falésias, areias coloridas, artesanato local e buggy opcional.',
    descricao: 'Morro Branco tem a sua beleza natural nas falésias que o cercam, sendo lar das areias coloridas e artesanatos locais. Morro Branco é ideal para você que procura descanso e um pouco de natureza. Temos como opcional no local o mais elogiado passeio de buggy, no qual você poderá conhecer mais 2 praias e uma linda lagoa, sempre com parada para aquele banho refrescante e divertir-se também no famoso Skibunda.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'morro-branco',
    nomePersonalizado: 'morro-branco',
    categoria: 'passeio'
  },
  {
    titulo: 'Mundaú',
    descricaoCurta: 'Lugar incrível com catamarã no rio, paisagens e banho em paraíso natural.',
    descricao: 'Mundaú fica no litoral oeste do Ceará e é um lugar incrível para se conhecer, é diversão garantida para você, com belas paisagens e um passeio de catamarã pelo Rio Mundaú, com duração de 1:30h, paradas para banho e contemplação desse paraíso natural.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'mundau',
    nomePersonalizado: 'mundau',
    categoria: 'passeio'
  },
  {
    titulo: 'Paracuru',
    descricaoCurta: 'Praia central linda, deserta e paradisíaca com farol e deck.',
    descricao: 'A praia central de Paracuru é um dos principais pontos turísticos da região e é um verdadeiro cartão postal, descrita como linda, deserta e paradisíaca. Com o famoso farol em frente ao mar verde-esmeralda, ao seu lado fica um deck de onde você pode apreciar esta vista exuberante.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'paracuru',
    nomePersonalizado: 'paracuru',
    categoria: 'passeio'
  },
  {
    titulo: 'Praia das Fontes',
    descricaoCurta: 'Praia com grutas, fontes naturais e águas quentes.',
    descricao: 'Este passeio está disponível para quem vai conhecer Morro Branco. Essa é uma das mais belas praias do Ceará, possuindo grutas, fontes naturais de água doce e uma praia de águas quentes e areia fofa.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'praia-das-fontes',
    nomePersonalizado: 'praia-das-fontes',
    categoria: 'passeio'
  },
  {
    titulo: 'Prainha',
    descricaoCurta: 'Praia de Aquiraz com dunas perfeitas para buggy e descidas radicais.',
    descricao: 'Prainha está localizada na primeira capital do Ceará, em Aquiraz. Tem seu artesanato forte e dunas perfeitas para o passeio de buggy, onde você pode explorar as dunas e uma descida radical no chamado insano natural.',
    preco: 0,
    destaque: false,
    imagens: [],
    slug: 'prainha',
    nomePersonalizado: 'prainha',
    categoria: 'passeio'
  }
];

export const importarPacotesPasseioLegal = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'pacotes'));
    const existingSlugs = new Set(snapshot.docs.map(doc => doc.data().slug || ''));

    for (const pacote of pacotes) {
      const slug = pacote.slug || normalizeSlug(pacote.titulo);
      if (existingSlugs.has(slug)) continue;

      const docRef = doc(collection(db, 'pacotes'));
      await setDoc(docRef, {
        ...pacote,
        id: docRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        precoOriginal: null,
        isIdaEVolta: false,
        precoIda: 0,
        precoVolta: 0,
        precoIdaVolta: 0,
        valorSinal: 0,
        valorPrimeiraViagem: 0,
        valorSegundaViagem: 0,
        valorSinalCalculado: 0,
        valorParaMotorista: 0,
        porcentagemSinalPadrao: 40
      });

      existingSlugs.add(slug);
    }

    return { sucesso: true, totalImportados: pacotes.length };
  } catch (error) {
    console.error('Erro ao importar pacotes:', error);
    return { sucesso: false, erro: error.message };
  }
};

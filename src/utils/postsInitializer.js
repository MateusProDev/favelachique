import { postsService } from '../services/postsService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Posts iniciais para o blog
 */
const POSTS_INICIAIS = [
  {
    titulo: 'Descubra a Verdadeira Essência da Comunidade',
    slug: 'descubra-essencia-comunidade',
    descricao: 'Conheça a história, cultura e as pessoas que fazem deste lugar único. Uma experiência transformadora que vai além do turismo convencional.',
    conteudo: `
      <h2>Uma Jornada Inesquecível</h2>
      <p>Nossos tours são muito mais do que simples passeios turísticos. São experiências imersivas que conectam você com a verdadeira essência da comunidade.</p>
      
      <h3>O que você vai descobrir:</h3>
      <ul>
        <li><strong>História Autêntica:</strong> Guias locais compartilham histórias reais e emocionantes</li>
        <li><strong>Cultura Viva:</strong> Experimente tradições, música e gastronomia local</li>
        <li><strong>Conexão Humana:</strong> Conheça as pessoas que fazem este lugar especial</li>
        <li><strong>Impacto Social:</strong> Seu tour apoia diretamente a comunidade</li>
      </ul>
      
      <p>Cada tour é cuidadosamente planejado para proporcionar segurança, conforto e uma experiência única que você vai levar para sempre.</p>
    `,
    categoria: 'Experiências',
    autor: 'Favela Chique',
    imagemCapa: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    tags: ['tour', 'cultura', 'experiência'],
    publicado: true
  },
  {
    titulo: 'Turismo Sustentável: Transformando Vidas',
    slug: 'turismo-sustentavel-transformando-vidas',
    descricao: 'Como o turismo comunitário está gerando renda, preservando culturas e criando oportunidades para moradores locais.',
    conteudo: `
      <h2>O Poder do Turismo Responsável</h2>
      <p>Quando você escolhe fazer um tour conosco, você está fazendo muito mais do que conhecer um novo lugar. Você está contribuindo para transformar vidas.</p>
      
      <h3>Nosso Impacto:</h3>
      <ul>
        <li><strong>Geração de Renda:</strong> 100% dos guias são moradores locais</li>
        <li><strong>Preservação Cultural:</strong> Mantemos vivas as tradições e histórias</li>
        <li><strong>Educação:</strong> Parte da renda vai para projetos educacionais</li>
        <li><strong>Sustentabilidade:</strong> Práticas eco-friendly em todos os tours</li>
      </ul>
      
      <p>Juntos, estamos provando que turismo pode ser uma força positiva de mudança social.</p>
    `,
    categoria: 'Impacto Social',
    autor: 'Favela Chique',
    imagemCapa: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    tags: ['sustentabilidade', 'impacto social', 'comunidade'],
    publicado: true
  },
  {
    titulo: 'Gastronomia Local: Sabores que Contam Histórias',
    slug: 'gastronomia-local-sabores-historias',
    descricao: 'Descubra os pratos típicos, receitas de família e a culinária que representa a alma da comunidade.',
    conteudo: `
      <h2>Uma Viagem Gastronômica Única</h2>
      <p>A comida é muito mais do que nutrição - é memória, é cultura, é identidade. Nosso tour gastronômico te leva aos sabores autênticos da comunidade.</p>
      
      <h3>O que você vai experimentar:</h3>
      <ul>
        <li><strong>Pratos Tradicionais:</strong> Receitas passadas de geração em geração</li>
        <li><strong>Ingredientes Locais:</strong> Frescos e produzidos na região</li>
        <li><strong>História por trás dos Pratos:</strong> Cada receita tem uma história</li>
        <li><strong>Cozinheiras Locais:</strong> Aprenda com quem faz há décadas</li>
      </ul>
      
      <p>Prepare-se para uma explosão de sabores e emoções em cada garfada!</p>
    `,
    categoria: 'Gastronomia',
    autor: 'Favela Chique',
    imagemCapa: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    tags: ['gastronomia', 'culinária', 'tradição'],
    publicado: true
  }
];

/**
 * Inicializa posts no Firestore se não existirem
 */
export const inicializarPosts = async () => {
  try {
    // Verifica se já existem posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    
    if (postsSnapshot.empty) {
      console.log('📝 Inicializando posts do blog...');
      
      for (const post of POSTS_INICIAIS) {
        await postsService.createPost(post);
        console.log(`✅ Post criado: ${post.titulo}`);
      }
      
      console.log('🎉 Posts inicializados com sucesso!');
      return true;
    } else {
      console.log('ℹ️ Posts já existem no banco de dados');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar posts:', error);
    return false;
  }
};

export default inicializarPosts;

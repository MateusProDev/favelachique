import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Importe o Link
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import Boxes from '../../components/Boxes/Boxes';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Carousel from '../../components/Carousel/Carousel';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './Home.css';

const Home = () => {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [regularPackages, setRegularPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const packagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));

        setFeaturedPackages(packagesData.filter(pkg => pkg.destaque === true));
        setRegularPackages(packagesData.filter(pkg => pkg.destaque !== true));
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return <div className="loading">Carregando pacotes...</div>;
  }

  return (
    <div className="home-container">
      <Header />
      <Banner />
      
      {/* Seção de Pacotes em Destaque */}
      {featuredPackages.length > 0 && (
        <section className="featured-packages-section">
          <h2 className="section-title">Pacotes em Destaque</h2>
          <div className="featured-packages-grid">
            {featuredPackages.map(pkg => (
              <div key={pkg.id} className="package-card">
                {pkg.imagens && pkg.imagens[0] && (
                  <div className="package-image">
                    <img src={pkg.imagens[0]} alt={pkg.titulo} />
                  </div>
                )}
                <h3>{pkg.titulo}</h3>
                <p className="short-description">{pkg.descricaoCurta}</p>
                <div className="price-container">
                  {pkg.precoOriginal && (
                    <span className="original-price">
                      De: R$ {pkg.precoOriginal.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="current-price">
                    Por: R$ {pkg.preco.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Link to={`/pacote/${pkg.id}`} className="details-link">Ver Detalhes</Link>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Seção de Outros Pacotes */}
      {regularPackages.length > 0 && (
        <section className="regular-packages-section">
          <h2 className="section-title">Nossos Pacotes</h2>
          <div className="regular-packages-scroll">
            {regularPackages.map(pkg => (
              <div key={pkg.id} className="package-scroll-card">
                {pkg.imagens && pkg.imagens[0] && (
                  <div className="scroll-image">
                    <img src={pkg.imagens[0]} alt={pkg.titulo} />
                  </div>
                )}
                <h3>{pkg.titulo}</h3>
                <div className="price-scroll">
                  R$ {pkg.preco.toFixed(2).replace('.', ',')}
                </div>
                <Link to={`/pacote/${pkg.id}`} className="details-link">Ver Detalhes</Link>
              </div>
            ))}
          </div>
        </section>
      )}
      
      <Boxes />
      <Carousel />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Home;
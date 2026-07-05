import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Sucesso.css';
import { FaCheckCircle, FaInstagram, FaFacebookF, FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Sucesso = () => {
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    whatsapp: ''
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const footerRef = doc(db, 'content', 'footer');
        const footerDoc = await getDoc(footerRef);

        if (footerDoc.exists()) {
          const data = footerDoc.data();
          setSocialLinks({
            instagram: data.social?.instagram?.link || '',
            facebook: data.social?.facebook?.link || '',
            whatsapp: data.social?.whatsapp?.link || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar links sociais:', error);
      }
    };

    fetchSocialLinks();
  }, []);

  return (
    <div className="sucesso-page">
      <Header />
      <main className="sucesso-container">
        <div className="sucesso-card">
          <div className="sucesso-icon" aria-hidden="true">
            <FaCheckCircle />
          </div>
          <h1 className="sucesso-title">Sua reserva foi enviada com sucesso!</h1>
          <p className="sucesso-text">
            Obrigado por entrar em contato conosco. Nossa equipe irá analisar sua solicitação e
            retornará em breve pelo WhatsApp ou e-mail com mais detalhes da sua experiência.
          </p>

          <p className="sucesso-text">
            Enquanto isso, siga nossas redes sociais para acompanhar novidades, promoções e inspirações para sua próxima viagem.
          </p>

          <div className="sucesso-socials">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer">
                <FaInstagram /> Instagram
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer">
                <FaFacebookF /> Facebook
              </a>
            )}
            {socialLinks.whatsapp && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
                <FaWhatsapp /> WhatsApp
              </a>
            )}
          </div>

          <div className="sucesso-actions">
            <Link to="/" className="sucesso-btn sucesso-btn-primary">
              Voltar ao início <FaArrowRight />
            </Link>
            <Link to="/contato" className="sucesso-btn sucesso-btn-secondary">
              Falar com a equipe
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sucesso;

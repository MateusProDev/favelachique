import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import OperatingHours from "./OperatingHours";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaYoutube,
  FaArrowRight
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [hasHours, setHasHours] = useState(false);
  const [hoursAccordionOpen, setHoursAccordionOpen] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const footerRef = doc(db, "content", "footer");
        const footerDoc = await getDoc(footerRef);
        if (footerDoc.exists()) {
          setFooterData(footerDoc.data());
        }

        // Verificar se há dados de horários
        const hoursRef = doc(db, "content", "hours");
        const hoursDoc = await getDoc(hoursRef);
        if (hoursDoc.exists() && hoursDoc.data().hours?.length > 0) {
          setHasHours(true);
        }
      } catch (error) {
        console.error("Erro ao buscar rodapé:", error);
      }
    };

    fetchFooterData();
  }, []);

  if (!footerData) return <div className="footer-loading">Carregando...</div>;

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <h3>{footerData.companyName || "20 Buscar"}</h3>
            </div>
            <p className="footer-tagline">
              {footerData.text || "Sua melhor experiência turística no Rio de Janeiro"}
            </p>
            
            <div className="footer-social-icons">
              {footerData.social?.instagram?.link && (
                <a 
                  href={footerData.social.instagram.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn social-instagram"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {footerData.social?.facebook?.link && (
                <a 
                  href={footerData.social.facebook.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn social-facebook"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
              )}
              {footerData.social?.whatsapp?.link && (
                <a 
                  href={footerData.social.whatsapp.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn social-whatsapp"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
              )}
              {footerData.social?.twitter?.link && (
                <a 
                  href={footerData.social.twitter.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn social-twitter"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
              )}
              {footerData.social?.youtube?.link && (
                <a 
                  href={footerData.social.youtube.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn social-youtube"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section footer-links">
            <h4 className="footer-section-title">Links Rápidos</h4>
            <ul className="footer-menu">
              <li><Link to="/"><FaArrowRight /> Início</Link></li>
              <li><Link to="/about"><FaArrowRight /> Sobre Nós</Link></li>
              <li><Link to="/pacotes"><FaArrowRight /> Pacotes</Link></li>
              <li><Link to="/blog"><FaArrowRight /> Blog</Link></li>
              <li><Link to="/contato"><FaArrowRight /> Contato</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section footer-contact">
            <h4 className="footer-section-title">Contato</h4>
            <div className="contact-info-list">
              {footerData.contact?.phone && (
                <a href={`tel:${footerData.contact.phone}`} className="contact-info-item">
                  <div className="contact-icon-wrapper">
                    <FaPhone />
                  </div>
                  <div className="contact-info-text">
                    <span className="contact-label">Telefone</span>
                    <span className="contact-value">{footerData.contact.phone}</span>
                  </div>
                </a>
              )}
              {footerData.contact?.email && (
                <a href={`mailto:${footerData.contact.email}`} className="contact-info-item">
                  <div className="contact-icon-wrapper">
                    <FaEnvelope />
                  </div>
                  <div className="contact-info-text">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">{footerData.contact.email}</span>
                  </div>
                </a>
              )}
              {footerData.contact?.address && (
                <div className="contact-info-item">
                  <div className="contact-icon-wrapper">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="contact-info-text">
                    <span className="contact-label">Endereço</span>
                    <span className="contact-value">{footerData.contact.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hours Column with Accordion */}
          {hasHours && (
            <div className="footer-section footer-hours">
              <button 
                className="footer-section-title hours-accordion-toggle"
                onClick={() => setHoursAccordionOpen(!hoursAccordionOpen)}
                aria-expanded={hoursAccordionOpen}
              >
                <span className="hours-title-content">
                  <FaClock /> Horários
                </span>
                <span className={`accordion-icon ${hoursAccordionOpen ? 'open' : ''}`}>▼</span>
              </button>
              <div className={`hours-accordion-content ${hoursAccordionOpen ? 'open' : ''}`}>
                <OperatingHours />
              </div>
            </div>
          )}
        </div>

        {/* Map Section */}
        {footerData.contact?.address && (
          <div className="footer-map-section">
            <div className="footer-map-container">
              <iframe
                title="Localização da Empresa"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  footerData.contact.address
                )}&output=embed`}
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        )}

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              &copy; {footerData.year || new Date().getFullYear()}{" "}
              <strong>{footerData.companyName || "20 Buscar"}</strong>. Todos os direitos reservados.
            </p>
            {footerData.legalLinks && footerData.legalLinks.length > 0 && (
              <div className="footer-legal-links">
                {footerData.legalLinks.map((link, index) => (
                  <a key={index} href={link.url}>{link.text}</a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
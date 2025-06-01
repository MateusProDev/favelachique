import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import OperatingHours from "./OperatingHours";
import "./Footer.css";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const footerRef = doc(db, "content", "footer");
        const footerDoc = await getDoc(footerRef);
        if (footerDoc.exists()) {
          setFooterData(footerDoc.data());
        }
      } catch (error) {
        console.error("Erro ao buscar rodapé:", error);
      }
    };

    fetchFooterData();
  }, []);

  if (!footerData) return <p>Carregando...</p>;

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand/Logo Column */}
        <div className="footer-col">
          <div className="footer-brand">
            {footerData.companyName || "Sua Empresa"}
          </div>
          <div className="footer-description">
            {footerData.text}
          </div>
          <div className="footer-social">
            {footerData.social &&
              Object.keys(footerData.social).map((key) => {
                const network = footerData.social[key];
                return network.logo && network.link ? (
                  <a 
                    key={key} 
                    href={network.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <img 
                      src={network.logo} 
                      alt={network.title || key} 
                      width="24"
                      height="24"
                    />
                  </a>
                ) : null;
              })}
          </div>
        </div>

        {/* Contact Column */}
        <div className="footer-col">
          <h4>Contato</h4>
          <ul className="footer-contact">
            {footerData.contact?.phone && (
              <li><strong>Telefone:</strong> {footerData.contact.phone}</li>
            )}
            {footerData.contact?.email && (
              <li><strong>Email:</strong> {footerData.contact.email}</li>
            )}
            {footerData.contact?.address && (
              <li><strong>Endereço:</strong> {footerData.contact.address}</li>
            )}
          </ul>
          
          <div className="operating-hours">
            <OperatingHours />
          </div>
        </div>

        {/* Map - Full Width */}
        {footerData.contact?.address && (
          <div className="footer-map">
            <iframe
              title="Localização da Empresa"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                footerData.contact.address
              )}&output=embed`}
              width="100%"
              height="300"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        )}

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            &copy; {footerData.year || new Date().getFullYear()}{" "}
            {footerData.companyName || "Sua Empresa"}. Todos os direitos reservados.
          </p>
          <div className="footer-legal">
            {footerData.legalLinks?.map((link, index) => (
              <a key={index} href={link.url}>{link.text}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
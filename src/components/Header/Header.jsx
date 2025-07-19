import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FiMenu, FiX, FiHome, FiInfo, FiUser } from 'react-icons/fi';

const Header = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHeaderData = async () => {
      const headerRef = doc(db, 'content', 'header');
      const headerDoc = await getDoc(headerRef);

      if (headerDoc.exists()) {
        const url = headerDoc.data().logoUrl;
        console.log("URL da Logo: ", url);
        setLogoUrl(url);
      } else {
        console.log('Nenhuma logo encontrada!');
      }
    };

    fetchHeaderData();
  }, []);

  return (
    <header className="header">
      <div className="header-logo">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" />
        ) : (
          <p>Logo não disponível</p>
        )}
      </div>

      <button className="header-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav className={`header-nav ${menuOpen ? 'nav-open' : ''}`}>
        <ul className="header-nav-list">
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <FiHome className="nav-icon" /> Home
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMenuOpen(false)}>
              <FiInfo className="nav-icon" /> Sobre nós
            </Link>
          </li>
          <li>
            <Link to="/usuario" onClick={() => setMenuOpen(false)}>
              <FiUser className="nav-icon" /> Área do Usuário
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
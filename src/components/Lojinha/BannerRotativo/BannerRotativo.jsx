import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./BannerRotativo.css";

const BannerRotativo = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true); // Adiciona estado de carregamento

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const bannersCollection = collection(db, "bannersLojinha");
        const snapshot = await getDocs(bannersCollection);
        const bannersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          imageUrl: doc.data().imageUrl,
        }));
        setBanners(bannersData);
      } catch (error) {
        console.error("Erro ao buscar banners:", error);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="rotativo-container">
      {loading ? (
        <p className="rotativo-placeholder">Carregando banners...</p>
      ) : banners.length > 0 ? (
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          className="rotativo-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <img
                src={banner.imageUrl}
                alt="Banner"
                className="rotativo-image"
                onError={(e) => (e.target.src = "/placeholder-image.jpg")} // Imagem reserva em caso de erro
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="rotativo-placeholder">Nenhum banner disponível</p>
      )}
    </div>
  );
};

export default BannerRotativo;
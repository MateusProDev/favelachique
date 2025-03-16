import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Carousel.css";

const Carousel = () => {
  const [carouselData, setCarouselData] = useState({
    sectionTitle: "",
    images: [],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const carouselRef = doc(db, "content", "carousel");
        const carouselDoc = await getDoc(carouselRef);

        if (carouselDoc.exists()) {
          setCarouselData(carouselDoc.data());
        } else {
          console.log("Carrossel não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (carouselData.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.images.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [carouselData.images]);

  return (
    <div className="carousel-section">
      {carouselData.sectionTitle && (
        <h2 className="section-title">{carouselData.sectionTitle}</h2>
      )}
      <div className="carousel">
        {carouselData.images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? "active" : ""}`}
          >
            <img src={image.url} alt={`Carrossel ${index}`} className="carousel-image" />
            {image.title && <p className="image-title">{image.title}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
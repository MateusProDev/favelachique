import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "./Boxes.css";

const Boxes = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const boxesRef = doc(db, "content", "boxes");

    const unsubscribe = onSnapshot(boxesRef, (docSnap) => {
      if (docSnap.exists()) {
        setSections(docSnap.data().sections || []);
      } else {
        console.log("Seções não encontradas!");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="boxes-wrapper">
      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="boxes-section">
          <h2 className="boxes-section-title">{section.title}</h2>
          <div className="boxes-grid">
            {section.boxes.map((box, boxIndex) => (
              <article key={boxIndex} className="box-item">
                <img src={box.imageUrl} alt={box.title} className="box-image" />
                <h3 className="box-title">{box.title}</h3>
                <p className="box-content">{box.content}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Boxes;
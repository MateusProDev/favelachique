import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./OperatingHours.css";

const OperatingHours = () => {
  const [hours, setHours] = useState([]);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const docRef = doc(db, "content", "hours");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHours(docSnap.data().hours || []);
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    };

    fetchHours();
  }, []);

  if (!hours.length) return null;

  return (
    <div className="operating-hours">
      <h3>Horários de Funcionamento</h3>
      <ul>
        {hours.map((item, index) => (
          <li key={index}>
            <span>{item.day}</span>
            <span>{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperatingHours;

import React from "react";
import "../style/global.css";
import "./QuickHub.css";
import logo from "../assets/logo.png";

export default function QuickHub() {
  return (
    <>
      <div className="global-rectangle">
        <h1 className="global-title">QUICKHUB</h1>
      </div>

      <div className="quickhub-simple">
        <div className="bentoRectangle">
          <h2>Velkommen til PlayWorld!</h2>
          <p>Logg inn for full tilgang til alle tjenester.</p>
          <button className="login-btn">Logg inn</button>
        </div>
        
        <div className="card-row">
          <div className="small-card purchase-card">
            <h3>Kjøp Billetter</h3>
          </div>
        </div>
        
        <div className="card-row">
          <div className="small-card">
            <h3>Mine Billetter</h3>
            <p>Se dine billetter</p>
          </div>
        </div>
        
        <div className="card-row">
          <div className="small-card">
            <h3>Mine Produkter</h3>
            <p>Se dine produkter</p>
          </div>
          <div className="small-card">
            <h3>Kuponger</h3>
            <p>Dine tilbud og rabatter</p>
          </div>
        </div>
        

      </div>
    </>
  );
}
import React, { useEffect, useRef, useState } from "react";

export default function AnimatedBackground() {
  const [ships, setShips] = useState([]);
  const [lasers, setLasers] = useState([]);
  const [explosions, setExplosions] = useState([]);

  const mousePos = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  const shipCount = 5;

  
  useEffect(() => {
    const move = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  
  useEffect(() => {
    const newShips = [];
    for (let i = 0; i < shipCount; i++) {
      newShips.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        dx: (Math.random() - 0.5) * 5, 
        dy: (Math.random() - 0.5) * 5, 
        nextShoot: Date.now() + 1500 + Math.random() * 1500 
      });
    }
    setShips(newShips);
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setShips((prev) =>
        prev.map((s) => {
          let x = s.x + s.dx;
          let y = s.y + s.dy;

          
          if (x < 0) x = window.innerWidth;
          if (x > window.innerWidth) x = 0;
          if (y < 0) y = window.innerHeight;
          if (y > window.innerHeight) y = 0;

          if (Date.now() >= s.nextShoot) {
            const angle = Math.atan2(
              mousePos.current.y - y,
              mousePos.current.x - x
            );

            setLasers((prevL) => [
              ...prevL,
              {
                id: Math.random(),
                x,
                y,
                dx: Math.cos(angle) * 5.5,
                dy: Math.sin(angle) * 5.5,
                angle
              }
            ]);

            return {
              ...s,
              x,
              y,
              nextShoot: Date.now() + 1500 + Math.random() * 1200
            };
          }

          return { ...s, x, y };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setLasers((prev) =>
        prev
          .map((l) => {
            const x = l.x + l.dx;
            const y = l.y + l.dy;

        
            const dist = Math.hypot(
              x - mousePos.current.x,
              y - mousePos.current.y
            );
            if (dist < 20) {
              spawnExplosion(mousePos.current.x, mousePos.current.y);
              return null;
            }

            return { ...l, x, y };
          })
          .filter(Boolean)
          .filter(
            (l) =>
              l.x > 0 &&
              l.x < window.innerWidth &&
              l.y > 0 &&
              l.y < window.innerHeight
          )
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);


  const spawnExplosion = (x, y) => {
    const particles = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({
        id: Math.random(),
        x,
        y,
        dx: Math.cos(angle) * (Math.random() * 3 + 2),
        dy: Math.sin(angle) * (Math.random() * 3 + 2),
        life: 25 + Math.random() * 10
      });
    }

    setExplosions((prev) => [...prev, ...particles]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setExplosions((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.dx,
            y: p.y + p.dy,
            life: p.life - 1
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const ShipSVG1 = (
    <svg viewBox="0 0 741 1255" width="60" height="60">
      <path fill="#1560d6" d="M565 728c-6 68-15 130-29 186 88 38 156 106 187 188 12-32 18-65 18-100 0-116-70-217-176-274zM265 1020l8 25h194l9-25H265z"/>
      <path fill="#e83d37" d="M210 937c8 30 17 58 26 83h269c9-25 18-53 26-83H210z"/>
      <path fill="#1560d6" d="M0 1002c0 35 6 68 18 100 31-82 99-150 187-188-14-55-23-118-29-186A314 314 0 0 0 0 1002z"/>
      <path fill="#DFE3E5" d="M571 585c0-125-30-241-67-337a395 395 0 0 1-270 0c-36 94-64 209-64 337a1658 1658 0 0 0 34 329l6 23h321l5-23a1313 1313 0 0 0 35-329z"/>
      <circle fill="#B8BDBF" cx="370" cy="481" r="100"/>
      <path fill="#ead3b0" d="M455 481a85 85 0 1 1-170 0 85 85 0 0 1 170 0z"/>
      <path fill="#1560d6" d="M234 248a394 394 0 0 0 270 0C446 98 370 0 370 0c-9 10-81 104-136 248z"/>
    </svg>
  );

  const ShipSVG2 = (
    <svg viewBox="0 0 741 1255" width="60" height="60">
      <path fill="#ED1C24" d="M565 728c-6 68-15 130-29 186 88 38 156 106 187 188 12-32 18-65 18-100 0-116-70-217-176-274zM265 1020l8 25h194l9-25H265z"/>
      <path fill="#8074B5" d="M210 937c8 30 17 58 26 83h269c9-25 18-53 26-83H210z"/>
      <path fill="#ED1C24" d="M0 1002c0 35 6 68 18 100 31-82 99-150 187-188-14-55-23-118-29-186A314 314 0 0 0 0 1002z"/>
      <path fill="#DFE3E5" d="M571 585c0-125-30-241-67-337a395 395 0 0 1-270 0c-36 94-64 209-64 337a1658 1658 0 0 0 34 329l6 23h321l5-23a1313 1313 0 0 0 35-329z"/>
      <circle fill="#B8BDBF" cx="370" cy="481" r="100"/>
      <path fill="#B3E3F4" d="M455 481a85 85 0 1 1-170 0 85 85 0 0 1 170 0z"/>
      <path fill="#ED1C24" d="M234 248a394 394 0 0 0 270 0C446 98 370 0 370 0c-9 10-81 104-136 248z"/>
    </svg>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: -1,
        background:
          "linear-gradient(135deg, #1a0033 0%, #2d1b4e 25%, #4a2c6d 50%, #6b3d8c 75%, #8b4fab 100%)"
      }}
    >
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${Math.random() * 300 + 100}px`,
            height: "2px",
            background: `rgba(138, 43, 226, ${Math.random() * 0.3 + 0.1})`,
            boxShadow: "0 0 10px rgba(138, 43, 226, 0.5)",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `moveLine ${Math.random() * 20 + 10}s linear infinite`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}

      {ships.map((s, i) => {
        const angle = Math.atan2(
          mousePos.current.y - s.y,
          mousePos.current.x - s.x
        );

        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              transform: `translate(-50%, -50%) rotate(${angle +
                Math.PI / 2}rad)`,
              filter: "drop-shadow(0px 0px 10px rgba(255,255,255,0.4))"
            }}
          >
            {i % 2 === 0 ? ShipSVG1 : ShipSVG2}
          </div>
        );
      })}

      {lasers.map((l) => (
        <div
          key={l.id}
          style={{
            position: "absolute",
            left: l.x,
            top: l.y,
            width: "6px",
            height: "20px",
            background: "red",
            transform: `translate(-50%, -50%) rotate(${l.angle +
              Math.PI / 2}rad)`,
            boxShadow: "0 0 8px red"
          }}
        />
      ))}

      {explosions.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: "6px",
            height: "6px",
            background: "yellow",
            borderRadius: "50%",
            opacity: Math.max(p.life / 30, 0),
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 10px yellow"
          }}
        />
      ))}

      <style>{`
        @keyframes moveLine {
          0% { transform: translateX(-200px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 200px)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}


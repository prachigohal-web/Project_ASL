import { useEffect, useRef, useState } from "react";
import Auth from "./Auth";

export default function App() {
  const [user, setUser] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState("Starting...");

  useEffect(() => {
    if (!user) return;
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
      ) {
        const lm = results.multiHandLandmarks[0];

        // 👉 Finger detection
        const isFingerUp = (tip, pip) => tip.y < pip.y;

        const thumbUp = isFingerUp(lm[4], lm[3]);
        const indexUp = isFingerUp(lm[8], lm[6]);
        const middleUp = isFingerUp(lm[12], lm[10]);
        const ringUp = isFingerUp(lm[16], lm[14]);
        const pinkyUp = isFingerUp(lm[20], lm[18]);

        // 👉 Gesture logic
        if (thumbUp && indexUp && middleUp && ringUp && pinkyUp) {
          setGesture("✋ Open Hand");
        } else if (indexUp && !middleUp && !ringUp && !pinkyUp) {
          setGesture("☝️ Pointing");
        } else if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
          setGesture("👍 Thumbs Up");
        } else {
          setGesture("🤔 Unknown");
        }

        // 👉 Draw landmarks
        lm.forEach((p) => {
          ctx.beginPath();
          ctx.arc(
            p.x * canvas.width,
            p.y * canvas.height,
            5,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = "lime";
          ctx.fill();
        });
      } else {
        setGesture("No hand detected");
      }
    });

    const camera = new window.Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [user]);

  // 🔐 Show login first
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>GestureFlow ✋</h1>

      <div style={styles.box}>
        <canvas ref={canvasRef} width={640} height={480} />
        <video ref={videoRef} style={{ display: "none" }} />
      </div>

      <h2 style={styles.gesture}>{gesture}</h2>

      <button style={styles.logout} onClick={() => setUser(null)}>
        Logout
      </button>
    </div>
  );
}

// 🎨 Styles
const styles = {
  container: {
    textAlign: "center",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "2.5rem",
  },
  box: {
    margin: "20px auto",
    border: "2px solid #38bdf8",
    width: "640px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  gesture: {
    fontSize: "1.8rem",
    marginTop: "15px",
  },
  logout: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#ef4444",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white",
  },
};
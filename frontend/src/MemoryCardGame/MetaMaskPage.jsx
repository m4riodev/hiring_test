import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import backgroundGif from "../assets/images/play.gif";
import backgroundMusic from "../assets/audio/background-music.mp3";
import MetaMaskConnect from "../components/MetaMaskConnect";

const StyledContainer = styled(Box)({
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  backgroundImage: `url(${backgroundGif})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
  padding: "20px",
});

const StyledTitle = styled(Typography)({
  fontFamily: '"Orbitron", sans-serif',
  fontSize: "48px",
  color: "#ffcc00",
  textShadow: "0 0 10px #ffcc00, 0 0 20px #ffaa00, 0 0 30px rgba(255, 255, 255, 0.6)",
  marginTop: "30px",
  marginBottom: "30px",
});

const PixelButton = styled(Box)({
  display: "inline-block",
  backgroundColor: "#2c2c54",
  color: "#fff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "14px",
  padding: "15px 30px",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  cursor: "pointer",
  textAlign: "center",
  position: "absolute",
  top: "40px",
  left: "40px",
  transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
  "&:hover": {
    backgroundColor: "#40407a",
    borderColor: "#00aaff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
});

const ContentBox = styled(Box)({
  backgroundColor: "rgba(44, 44, 84, 0.85)",
  padding: "30px",
  borderRadius: "12px",
  border: "2px solid #00d9ff",
  maxWidth: "600px",
  width: "100%",
  marginTop: "30px",
});

const MetaMaskPage = () => {
  const navigate = useNavigate();
  const [bgVolume] = useState(parseInt(localStorage.getItem("bgVolume"), 10) || 0);
  const audioRef = useRef(null);
  const [musicStarted, setMusicStarted] = useState(false);

  useEffect(() => {
    // Initialize and play background music
    const handleFirstClick = () => {
      if (!musicStarted && audioRef.current) {
        audioRef.current.volume = bgVolume / 100;
        audioRef.current.play().catch((error) => console.error("Audio play error:", error));
        setMusicStarted(true);
      }
    };
    
    document.addEventListener("click", handleFirstClick);
    return () => document.removeEventListener("click", handleFirstClick);
  }, [bgVolume, musicStarted]);

  const handleBackButton = () => {
    navigate("/play");
  };

  return (
    <StyledContainer>
      <audio ref={audioRef} src={backgroundMusic} loop />
      
      <PixelButton onClick={handleBackButton}>
        Back
      </PixelButton>
      
      <StyledTitle variant="h2">Wallet Connection</StyledTitle>
      
      <ContentBox>
        <Typography 
          variant="h6" 
          sx={{ 
            color: "#fff",
            fontFamily: '"Orbitron", sans-serif',
            marginBottom: "20px",
            textAlign: "center"
          }}
        >
          Connect your MetaMask wallet to access Web3 features
        </Typography>
        
        <Typography 
          sx={{ 
            color: "#d3d3d3",
            fontFamily: '"Orbitron", sans-serif',
            fontSize: "14px",
            marginBottom: "30px",
            textAlign: "center"
          }}
        >
          Securely connect with your Ethereum wallet to view your balance and network information
        </Typography>
        
        <MetaMaskConnect />
      </ContentBox>
    </StyledContainer>
  );
};

export default MetaMaskPage; 
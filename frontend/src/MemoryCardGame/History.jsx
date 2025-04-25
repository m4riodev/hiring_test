import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import backgroundGif from "../assets/images/play.gif";
import backgroundMusic from "../assets/audio/background-music.mp3";
import config from "../config";

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

const PixelButton = styled(Button)({
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
  margin: "20px",
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

const StyledTableContainer = styled(TableContainer)({
  maxWidth: "80%",
  maxHeight: "70vh",
  backgroundColor: "rgba(44, 44, 84, 0.9)",
  borderRadius: "10px",
  overflowY: "auto",
  border: "2px solid #00d9ff",
  marginTop: "20px",
  "&::-webkit-scrollbar": {
    width: "12px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#00d9ff",
    borderRadius: "10px",
    border: "3px solid rgba(0, 0, 0, 0.2)",
  },
});

const StyledTableCell = styled(TableCell)({
  color: "#fff",
  fontFamily: '"Orbitron", sans-serif',
  fontSize: "16px",
  textAlign: "center",
  borderBottom: "1px solid #00aaff",
  padding: "16px",
});

const StyledTableHeadCell = styled(StyledTableCell)({
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  fontWeight: "bold",
  fontSize: "18px",
  color: "#00d9ff",
});

const StyledTitle = styled(Typography)({
  fontFamily: '"Orbitron", sans-serif',
  fontSize: "48px",
  color: "#ffcc00",
  textShadow: "0 0 10px #ffcc00, 0 0 20px #ffaa00, 0 0 30px rgba(255, 255, 255, 0.6)",
  marginTop: "30px",
  marginBottom: "30px",
});

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "#4caf50";
    case "Normal":
      return "#ffeb3b";
    case "Hard":
      return "#f44336";
    default:
      return "#ffffff";
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const History = () => {
  const navigate = useNavigate();
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const [musicStarted, setMusicStarted] = useState(false);
  
  const bgVolume = parseInt(localStorage.getItem("bgVolume"), 10) || 50;

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const userID = localStorage.getItem("userID");
        if (!userID) {
          navigate("/login");
          return;
        }
        
        const response = await axios.get(`${config.apiUrl}/api/memory/history?userID=${userID}`);
        if (response.data && response.data.message && response.data.error) {
          console.error("API Error:", response.data.error);
          setError(`Error fetching data: ${response.data.message}`);
          setGameHistory([]);
        } else if (Array.isArray(response.data)) {
          setGameHistory(response.data);
        } else if (response.data && typeof response.data === 'object') {
          const dataArray = response.data.history || response.data.games || response.data.data || [];
          setGameHistory(Array.isArray(dataArray) ? dataArray : []);
        } else {
          setGameHistory([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("Error loading game history. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchGameHistory();
    
    const handleFirstClick = () => {
      if (!musicStarted && audioRef.current) {
        audioRef.current.volume = bgVolume / 100;
        audioRef.current.play().catch((error) => console.error("Error playing audio:", error));
        setMusicStarted(true);
      }
    };
    
    document.addEventListener("click", handleFirstClick);
    return () => document.removeEventListener("click", handleFirstClick);
  }, [navigate, bgVolume, musicStarted]);

  const handleBackButton = () => {
    navigate("/play");
  };

  return (
    <StyledContainer>
      <audio ref={audioRef} src={backgroundMusic} loop />
      
      <PixelButton onClick={handleBackButton} sx={{ position: "absolute", top: "20px", left: "20px" }}>
        Back
      </PixelButton>
      
      <StyledTitle variant="h2">Game results</StyledTitle>
      
      {loading ? (
        <CircularProgress size={60} sx={{ color: "#00d9ff", marginTop: "50px" }} />
      ) : error ? (
        <Typography 
          variant="h6" 
          sx={{ 
            color: "#ff5252", 
            backgroundColor: "rgba(0,0,0,0.7)", 
            padding: "20px", 
            borderRadius: "10px", 
            marginTop: "50px" 
          }}
        >
          {error}
        </Typography>
      ) : gameHistory.length === 0 ? (
        <Typography 
          variant="h5" 
          sx={{ 
            color: "#ffffff", 
            backgroundColor: "rgba(0,0,0,0.7)", 
            padding: "20px", 
            borderRadius: "10px", 
            marginTop: "50px",
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          You don{"'"}t have any games recorded yet
        </Typography>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Date</StyledTableHeadCell>
                <StyledTableHeadCell>Difficulty</StyledTableHeadCell>
                <StyledTableHeadCell>Time</StyledTableHeadCell>
                <StyledTableHeadCell>Failed Attempts</StyledTableHeadCell>
                <StyledTableHeadCell>Completed</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(gameHistory) && gameHistory.map((game, index) => (
                <TableRow key={index}>
                  <StyledTableCell>{formatDate(game.gameDate)}</StyledTableCell>
                  <StyledTableCell sx={{ color: getDifficultyColor(game.difficulty) }}>
                    {game.difficulty}
                  </StyledTableCell>
                  <StyledTableCell>{formatTime(game.timeTaken)}</StyledTableCell>
                  <StyledTableCell>{game.failed}</StyledTableCell>
                  <StyledTableCell>
                    {game.completed ? "✅ Yes" : "❌ No"}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </StyledContainer>
  );
};

export default History; 
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";

const MetaMaskButton = styled(Button)({
  backgroundColor: "#F6851B",
  color: "#fff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "14px",
  padding: "15px 30px",
  border: "2px solid #E2761B",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  cursor: "pointer",
  textAlign: "center",
  margin: "20px 0",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
  "&:hover": {
    backgroundColor: "#E2761B",
    borderColor: "#CD6116",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  "&:disabled": {
    backgroundColor: "#A04907",
    borderColor: "#A04907",
    opacity: 0.7,
    cursor: "not-allowed",
  }
});

const WalletInfo = styled(Box)({
  backgroundColor: "rgba(44, 44, 84, 0.9)",
  padding: "20px",
  borderRadius: "10px",
  border: "2px solid #00d9ff",
  marginTop: "20px",
  width: "100%",
  maxWidth: "500px",
});

const AccountContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "15px",
});

const AccountInfo = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

const MetaMaskConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState("");
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true);

  useEffect(() => {
    checkIfMetaMaskIsInstalled();
    
    // Add listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      // Remove listeners on cleanup
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkIfMetaMaskIsInstalled = () => {
    const { ethereum } = window;
    if (!ethereum || !ethereum.isMetaMask) {
      setIsMetaMaskInstalled(false);
      setError("MetaMask is not installed. Please install MetaMask to connect your wallet.");
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount("");
      setBalance("");
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      fetchBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainIdHex) => {
    // Convert chainId from hex to decimal
    const networkId = parseInt(chainIdHex, 16);
    setChainId(networkId);
    
    // Refresh the page to ensure all data is in sync with the new chain
    window.location.reload();
  };

  const connectToMetaMask = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      setAccount(accounts[0]);

      // Get the current chain ID
      const chainIdHex = await window.ethereum.request({ 
        method: "eth_chainId" 
      });
      setChainId(parseInt(chainIdHex, 16));

      // Get balance
      await fetchBalance(accounts[0]);
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      if (err.code === 4001) {
        // User rejected the request
        setError("You rejected the connection request. Please try again.");
      } else {
        setError(err.message || "Failed to connect to MetaMask");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchBalance = async (address) => {
    try {
      const balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      
      // Convert hex balance to ETH
      const balanceInEth = ethers.utils.formatEther(balanceHex);
      setBalance(parseFloat(balanceInEth).toFixed(4));
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 11155111:
        return "Sepolia Testnet";
      case 137:
        return "Polygon Mainnet";
      case 80001:
        return "Mumbai Testnet";
      default:
        return `Network ID: ${chainId || "Unknown"}`;
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setBalance("");
  };

  const renderWalletInfo = () => {
    return (
      <WalletInfo>
        <AccountContainer>
          <AccountInfo>
            <img 
              src="/images/metamask-fox.svg" 
              alt="MetaMask" 
              style={{ width: "30px", height: "30px" }} 
            />
            <Typography 
              sx={{ 
                fontFamily: '"Orbitron", sans-serif',
                color: "#fff",
                fontSize: "16px"
              }}
            >
              {formatAddress(account)}
            </Typography>
          </AccountInfo>
          <Button 
            variant="outlined" 
            color="error"
            size="small"
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </AccountContainer>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <Typography sx={{ color: "#00d9ff", fontFamily: '"Orbitron", sans-serif' }}>
            Balance:
          </Typography>
          <Typography sx={{ color: "#fff", fontFamily: '"Orbitron", sans-serif' }}>
            {balance} ETH
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#00d9ff", fontFamily: '"Orbitron", sans-serif' }}>
            Network:
          </Typography>
          <Typography sx={{ color: "#fff", fontFamily: '"Orbitron", sans-serif' }}>
            {getNetworkName(chainId)}
          </Typography>
        </Box>
      </WalletInfo>
    );
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        width: "100%", 
        padding: "20px"
      }}
    >
      {!account ? (
        <>
          <MetaMaskButton 
            onClick={connectToMetaMask} 
            disabled={isConnecting || !isMetaMaskInstalled}
          >
            {isConnecting ? (
              <>
                <CircularProgress size={20} color="inherit" />
                Connecting...
              </>
            ) : (
              <>
                <img 
                  src="/images/metamask-fox.svg" 
                  alt="MetaMask"
                  style={{ width: "24px", height: "24px" }}
                />
                Connect MetaMask
              </>
            )}
          </MetaMaskButton>
          
          {!isMetaMaskInstalled && (
            <Button 
              variant="contained" 
              color="primary"
              href="https://metamask.io/download/" 
              target="_blank"
              sx={{ mt: 1 }}
            >
              Install MetaMask
            </Button>
          )}
          
          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mt: 2, 
                backgroundColor: "rgba(211, 47, 47, 0.1)", 
                padding: "10px",
                borderRadius: "5px",
                width: "100%",
                maxWidth: "500px",
                textAlign: "center"
              }}
            >
              {error}
            </Typography>
          )}
        </>
      ) : (
        renderWalletInfo()
      )}
    </Box>
  );
};

export default MetaMaskConnect; 
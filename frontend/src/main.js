import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './ContractInfo.js';

const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');

const registerDropZone = document.getElementById('registerDropZone');
const registerFileInput = document.getElementById('registerFileInput');
const registerFileName = document.getElementById('registerFileName');
const registerBtn = document.getElementById('registerBtn');
const registerResult = document.getElementById('registerResult');

const verifyDropZone = document.getElementById('verifyDropZone');
const verifyFileInput = document.getElementById('verifyFileInput');
const verifyFileName = document.getElementById('verifyFileName');
const verifyBtn = document.getElementById('verifyBtn');
const verifyResult = document.getElementById('verifyResult');

let provider;
let signer;
let contract;
let userAddress;
let registerFileHash = null;
let verifyFileHash = null;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();
      
      walletAddress.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
      connectBtn.textContent = 'Connected';
      connectBtn.style.background = 'var(--success)';
      connectBtn.style.color = '#fff';

      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    } catch (error) {
      console.error("User denied account access", error);
      alert("Please connect to MetaMask.");
    }
  } else {
    alert("Please install MetaMask!");
  }
}



connectBtn.addEventListener('click', connectWallet);

async function hashFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
}

function setupDropZone(dropZone, fileInput, fileNameDisplay, type) {
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0], fileNameDisplay, type);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0], fileNameDisplay, type);
    }
  });
}

async function handleFile(file, fileNameDisplay, type) {
  fileNameDisplay.textContent = `Selected: ${file.name}`;
  try {
    const hash = await hashFile(file);
    if (type === 'register') {
      registerFileHash = hash;
      registerBtn.disabled = false;
      showMessage(registerResult, `Calculated Hash: ${hash.substring(0, 15)}...`, 'success');
    } else {
      verifyFileHash = hash;
      verifyBtn.disabled = false;
      showMessage(verifyResult, `Calculated Hash: ${hash.substring(0, 15)}...`, 'success');
    }
  } catch (err) {
    console.error("Error hashing file", err);
    if (type === 'register') {
      showMessage(registerResult, "Error calculating hash", 'error');
    } else {
      showMessage(verifyResult, "Error calculating hash", 'error');
    }
  }
}

setupDropZone(registerDropZone, registerFileInput, registerFileName, 'register');
setupDropZone(verifyDropZone, verifyFileInput, verifyFileName, 'verify');


registerBtn.addEventListener('click', async () => {
  if (!contract) return alert("Please connect your wallet first.");
  if (!registerFileHash) return;

  registerBtn.disabled = true;
  registerBtn.textContent = 'Registering...';
  
  try {
    
    const existingDoc = await contract.documents(registerFileHash);
    
    if (existingDoc.exists) {
      const date = new Date(Number(existingDoc.timestamp) * 1000).toLocaleString();
      showMessage(
        registerResult, 
        `Document is already registered!\nOwner: ${existingDoc.owner}\nDate: ${date}`, 
        'success'
      );
      return; 
    }

    
    const tx = await contract.registerDocument(registerFileHash);
    showMessage(registerResult, `Transaction Pending... Please confirm in your wallet.`, 'success');
    
    await tx.wait();
    
    showMessage(registerResult, `Document registered successfully! Hash: ${registerFileHash.substring(0, 15)}...`, 'success');
  } catch (error) {
    console.error(error);
    const reason = error.reason || "Transaction rejected or failed.";
    showMessage(registerResult, `Registration failed: ${reason}`, 'error');
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = 'Register Hash';
  }
});

// Verify Document
verifyBtn.addEventListener('click', async () => {
  if (!contract) return alert("Please connect your wallet first.");
  if (!verifyFileHash) return;

  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';

  try {
    const [owner, timestamp] = await contract.verifyDocument(verifyFileHash);
    const date = new Date(Number(timestamp) * 1000).toLocaleString();
    
    showMessage(
      verifyResult, 
      `Document is authentic!\nRegistered by: ${owner}\nOn: ${date}`, 
      'success'
    );
  } catch (error) {
    console.error(error);
    showMessage(verifyResult, `Document not found in registry.`, 'error');
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify Hash';
  }
});

function showMessage(element, text, type) {
  element.innerText = text;
  element.className = `result-message ${type}`;
}

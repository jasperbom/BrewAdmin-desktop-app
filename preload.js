// preload.js — contextBridge voor veilige communicatie tussen renderer en main
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Kan uitgebreid worden met IPC calls indien nodig
  platform: process.platform,
});

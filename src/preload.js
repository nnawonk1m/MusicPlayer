// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lyricsAPI', {
  // returns Promise<{ok:boolean, text?:string, error?:string}>
  read: (filename) => ipcRenderer.invoke('read-lyrics', filename)
});
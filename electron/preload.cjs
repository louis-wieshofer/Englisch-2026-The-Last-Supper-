// Preload runs in an isolated context before the renderer. Keep it minimal —
// we don't need any IPC bridges for a static scrollytelling site.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronInfo', {
  platform: process.platform,
  isElectron: true,
});

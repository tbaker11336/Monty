// Expo's default config detects the npm workspace and watches ../core automatically.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// expo-sqlite's web build (used only for quick browser previews) ships a .wasm file.
config.resolver.assetExts.push('wasm');

module.exports = config;

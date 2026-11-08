// Expo's default config detects the npm workspace and watches ../core automatically.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);

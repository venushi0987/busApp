// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly add ttf to asset extensions to resolve vector icon fonts on Web
if (!config.resolver.assetExts.includes('ttf')) {
  config.resolver.assetExts.push('ttf');
}

module.exports = config;

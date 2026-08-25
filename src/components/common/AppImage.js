// src/components/common/AppImage.js
import React, { useState, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

const fallbackLogo = require('../../../assets/clogo.png');

export const AppImage = memo(({
  source,
  style,
  contentFit = 'contain',
  transition = 200,
  priority = 'normal',
  placeholder,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const resolvedSource = React.useMemo(() => {
    if (hasError || !source) return fallbackLogo;
    if (typeof source === 'string') {
      const trimmed = source.trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return fallbackLogo;
      }
      return { uri: trimmed };
    }
    if (typeof source === 'object' && source?.uri) {
      const trimmed = source.uri.trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return fallbackLogo;
      }
      return { ...source, uri: trimmed };
    }
    return source || fallbackLogo;
  }, [source, hasError]);

  return (
    <ExpoImage
      {...props}
      source={resolvedSource}
      style={style}
      contentFit={contentFit}
      transition={transition}
      priority={priority}
      cachePolicy="memory-disk"
      onError={() => setHasError(true)}
    />
  );
});

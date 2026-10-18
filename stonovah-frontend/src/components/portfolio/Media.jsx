// src/components/portfolio/Media.jsx
import React from 'react';
import { isVideo } from '../../pages/public/publicLive';

export default function Media({ url, alt = '', className = '', controls = false }) {
  if (!url) return <div className={`${className} bg-gradient-to-br from-neutral-900 to-red-950`} />;
  if (isVideo(url)) {
    return <video src={controls ? url : `${url}#t=0.5`} muted={!controls} controls={controls} preload="metadata" playsInline className={className} />;
  }
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}
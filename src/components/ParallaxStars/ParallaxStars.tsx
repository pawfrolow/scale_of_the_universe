import React from 'react';

import styles from './styles.module.scss';

export const ParallaxStars = () => (
  <div id="parallax-stars" className={styles.parallaxStars} aria-hidden="true">
    <div id="stars" />
    <div id="stars2" />
    <div id="stars3" />
  </div>
);

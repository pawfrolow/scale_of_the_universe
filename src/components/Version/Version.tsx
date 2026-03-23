import React from 'react';

import styles from './styles.module.scss';

export const Version = () => {
  return <div className={styles.version}>v{__APP_VERSION__}</div>;
};

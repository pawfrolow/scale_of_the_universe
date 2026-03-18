import React from 'react';

import styles from './styles.module.scss';

type LoaderProps = {
  size?: number;
};

export const Loader: React.FC<LoaderProps> = ({ size = 32 }) => {
  return (
    <div className={styles.loader}>
      <div
        className={styles.loaderSpinner}
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
};

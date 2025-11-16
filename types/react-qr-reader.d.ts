declare module 'react-qr-reader' {
  import type { ComponentType, CSSProperties } from 'react';

  export interface QrReaderProps {
    onResult?: (result: any, error: any) => void;
    constraints?: MediaTrackConstraints;
    containerStyle?: CSSProperties;
    videoStyle?: CSSProperties;
  }

  export const QrReader: ComponentType<QrReaderProps>;
  const DefaultExport: ComponentType<QrReaderProps>;
  export default DefaultExport;
}



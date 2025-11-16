declare module 'react-qr-reader' {
  import type { ComponentType, CSSProperties } from 'react';

  export interface QrReaderProps {
    onResult?: (result: any, error: any) => void;
    constraints?: MediaTrackConstraints;
    containerStyle?: CSSProperties;
    videoStyle?: CSSProperties;
    scanDelay?: number | false;
    onScan?: (result: string | null) => void;
    onError?: (error: any) => void;
  }

  export const QrReader: ComponentType<QrReaderProps>;
  const DefaultExport: ComponentType<QrReaderProps>;
  export default DefaultExport;
}



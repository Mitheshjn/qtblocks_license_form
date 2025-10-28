import React, { useEffect, useRef } from 'react';

// Declaration to inform TypeScript about the global Html5Qrcode class
declare global {
    interface Window {
        Html5Qrcode: any;
    }
}

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const qrScanner = new window.Html5Qrcode("qr-reader");
    scannerRef.current = qrScanner;
    
    const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        onScanSuccess(decodedText);
        qrScanner.stop().catch((err: any) => console.error("Failed to stop scanner", err));
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    qrScanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined)
      .catch((err: any) => {
        console.warn("Failed to start QR scanner with environment camera, trying user camera:", err);
        // Fallback to user camera if environment camera fails
        //qrScanner.start({ facingMode: "user" }, config, qrCodeSuccessCallback, undefined)
          //.catch((err2: any) => {
             //console.error("Failed to start QR scanner with any camera:", err2);
             //alert("Could not start QR scanner. Please ensure you have a camera and have granted permission.");
             //onClose();
          //});
      });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
            .then(() => console.log("QR scanner stopped successfully."))
            .catch((err: any) => console.error("Error stopping QR scanner on cleanup:", err));
      }
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-md relative">
        <h3 className="text-lg font-medium text-center mb-4">Scan Machine ID</h3>
        <div id="qr-reader" className="w-full"></div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800 bg-white bg-opacity-50 rounded-full"
          aria-label="Close scanner"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default QrScanner;

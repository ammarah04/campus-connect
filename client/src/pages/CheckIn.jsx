import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/axios.js";

function CheckIn() {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");
    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setResult(null);
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (isRunningRef.current) {
            isRunningRef.current = false;
            await scannerRef.current.stop();
            setScanning(false);
            handleScan(decodedText);
          }
        },
        () => {}
      );
      isRunningRef.current = true;
      setScanning(true);
    } catch (error) {
      setResult({ success: false, message: "Camera access failed. Check permissions." });
      setScanning(false);
    }
  };

  const handleScan = async (qrToken) => {
    try {
      const res = await api.post("/attendance/check-in", { qrToken });
      setResult({ success: true, message: res.data.message });
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.message || "Check-in failed" });
    }
  };

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-1">Event check-in</h1>
          <p className="text-muted text-sm mb-6">Scan attendee QR codes at the entrance</p>

          <div id="qr-reader" className="w-full rounded-lg overflow-hidden bg-paper border border-line" />

          {result && (
            <div
              className={`mt-4 p-3 rounded-md text-sm font-medium border ${
                result.success
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {result.message}
            </div>
          )}

          <button
            onClick={startScanning}
            disabled={scanning}
            className="w-full mt-4 bg-ink text-white py-2.5 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
          >
            {scanning ? "Scanning..." : "Start scanning"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckIn;
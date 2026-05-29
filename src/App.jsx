import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, Download, Video, Upload, RefreshCw, Hand, Settings, Play, LayoutGrid } from 'lucide-react';

const CATEGORIES = ['Tất Cả', 'Basic', 'Yêu Thương', 'Bạn Bè', 'Sang Chảnh', 'Cổ Điển', 'Dễ Thương', 'Dân Chơi', 'Lễ Hội', 'Hài Hước'];

// Generators for massive amount of options
const generateFrames = () => {
  const frames = [];
  
  // Basic (20)
  const basicColors = ['#ffffff', '#000000', '#f5f5f5', '#e0e0e0', '#f5f5dc', '#fff0f5', '#e6e6fa', '#ffffe0', '#f0fff0', '#f0ffff', '#ffe4e1', '#faebd7', '#ffefd5', '#ffdab9', '#eee8aa', '#98fb98', '#afeeee', '#add8e6', '#dda0dd', '#ffb6c1'];
  basicColors.forEach((color, i) => {
    frames.push({ id: `b${i}`, name: `Cơ bản ${i+1}`, cat: 'Basic', style: { background: color, padding: '15px' } });
  });

  // Yêu Thương (20)
  const loveColors = ['#ffb6c1', '#ff69b4', '#ff1493', '#c71585', '#db7093', '#ffc0cb', '#dc143c', '#ff0000', '#b22222', '#8b0000'];
  loveColors.forEach((color, i) => {
    frames.push({ id: `l_g${i}`, name: `Love Gradient ${i+1}`, cat: 'Yêu Thương', style: { background: `linear-gradient(45deg, ${color}, #ffffff)`, padding: '15px' } });
    frames.push({ id: `l_p${i}`, name: `Love Pattern ${i+1}`, cat: 'Yêu Thương', style: { padding: '15px', background: `${color} url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath d=\'M10 18.35L8.55 17.03C3.4 12.36 0 9.28 0 5.5C0 2.42 2.42 0 5.5 0C7.24 0 8.91 0.81 10 2.09C11.09 0.81 12.76 0 14.5 0C17.58 0 20 2.42 20 5.5C20 9.28 16.6 12.36 11.45 17.04L10 18.35Z\' fill=\'%23ffffff\' opacity=\'0.3\'/%3E%3C/svg%3E")` } });
  });

  // Bạn Bè (20)
  const friendColors = ['#87ceeb', '#00bfff', '#1e90ff', '#4169e1', '#0000ff', '#f0e68c', '#ffd700', '#ffa500', '#ff8c00', '#ff4500'];
  friendColors.forEach((color, i) => {
    frames.push({ id: `f_s${i}`, name: `Friend Stripe ${i+1}`, cat: 'Bạn Bè', style: { background: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, #ffffff 10px, #ffffff 20px)`, padding: '15px' } });
    frames.push({ id: `f_d${i}`, name: `Friend Dot ${i+1}`, cat: 'Bạn Bè', style: { background: `radial-gradient(${color} 15%, transparent 16%) 0 0, radial-gradient(${color} 15%, transparent 16%) 8px 8px, #ffffff`, backgroundSize: '16px 16px', padding: '15px' } });
  });

  // Dân Chơi (20)
  const neonColors = ['#39ff14', '#ff00ff', '#00ffff', '#ff9900', '#ff0000', '#ccff00', '#00ffcc', '#ff0099', '#9900ff', '#ffff00'];
  neonColors.forEach((color, i) => {
    frames.push({ id: `dc_n${i}`, name: `Neon ${i+1}`, cat: 'Dân Chơi', style: { background: '#000', padding: '15px', border: `4px solid ${color}`, boxShadow: `0 0 15px ${color}, inset 0 0 15px ${color}` } });
    frames.push({ id: `dc_g${i}`, name: `Cyber ${i+1}`, cat: 'Dân Chơi', style: { background: `repeating-radial-gradient(circle, #000, #000 10px, ${color} 10px, ${color} 12px)`, padding: '15px' } });
  });

  // Dễ Thương (20)
  const pastelColors = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e6e6fa', '#fff0f5', '#e0ffff', '#f5fffa', '#f0f8ff'];
  pastelColors.forEach((color, i) => {
    frames.push({ id: `dt_c${i}`, name: `Cute Caro ${i+1}`, cat: 'Dễ Thương', style: { background: `repeating-conic-gradient(${color} 0% 25%, #ffffff 0% 50%) 50% / 30px 30px`, padding: '15px' } });
    frames.push({ id: `dt_w${i}`, name: `Cute Wave ${i+1}`, cat: 'Dễ Thương', style: { background: `linear-gradient(to bottom, ${color}, #ffffff)`, padding: '15px', border: `5px dashed ${pastelColors[(i+1)%10]}` } });
  });

  // Hài Hước (20 emoji patterns)
  const emojis = ['🐶', '🐱', '💩', '🤡', '👽', '👻', '🐸', '🐵', '🐷', '🐔', '🦄', '🐝', '🦖', '🐢', '🤪', '🤩', '🤠', '🤮', '🤑', '🥵'];
  emojis.forEach((emoji, i) => {
    frames.push({ 
      id: `hh_${i}`, name: `Hài Hước ${emoji}`, cat: 'Hài Hước', 
      style: { 
        padding: '20px', 
        background: `#fdfd96 url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text y='35' font-size='30'>${emoji}</text></svg>")` 
      } 
    });
  });

  // Sang Chảnh & Cổ Điển & Lễ Hội (30)
  for(let i=0; i<10; i++) {
    frames.push({ id: `s_${i}`, name: `Luxury Gold ${i+1}`, cat: 'Sang Chảnh', style: { background: '#fff', padding: '15px', border: `${3+i}px solid #d4af37`, boxShadow: `inset 0 0 0 2px #fff, inset 0 0 0 ${4+i}px #d4af37` } });
    frames.push({ id: `c_${i}`, name: `Vintage Film ${i+1}`, cat: 'Cổ Điển', style: { background: '#222', padding: '15px', borderLeft: `${8+i}px dashed #fff`, borderRight: `${8+i}px dashed #fff` } });
    frames.push({ id: `lh_${i}`, name: `Festival ${i+1}`, cat: 'Lễ Hội', style: { background: `radial-gradient(circle, #ff0000, #ffff00)`, padding: '15px', border: `${2+i}px dotted #fff` } });
  }

  return frames;
};

const FRAMES = generateFrames(); // 150 frames

const generateFilters = () => {
  const filters = [{ id: 'normal', name: 'Bình Thường', filter: 'none' }];
  for(let i=1; i<=20; i++) {
    filters.push({ id: `bw_${i}`, name: `Đen Trắng ${i}`, filter: `grayscale(100%) contrast(${1 + i*0.05}) brightness(${0.8 + i*0.02})` });
    filters.push({ id: `sepia_${i}`, name: `Cổ Điển ${i}`, filter: `sepia(${50 + i*2}%) hue-rotate(-${i*2}deg) saturate(${1 + i*0.1})` });
    filters.push({ id: `color_${i}`, name: `Đa Sắc ${i}`, filter: `hue-rotate(${i*15}deg) saturate(${1 + i*0.1})` });
    filters.push({ id: `soft_${i}`, name: `Mềm Mại ${i}`, filter: `contrast(${0.9 - i*0.01}) brightness(${1.05 + i*0.01}) saturate(${1.1 + i*0.05}) blur(${0.2 + i*0.05}px)` });
    filters.push({ id: `cinematic_${i}`, name: `Điện Ảnh ${i}`, filter: `contrast(${1.2 + i*0.05}) saturate(${0.8 + i*0.05}) sepia(${10 + i}%)` });
  }
  return filters;
};

const FILTERS = generateFilters(); // 101 filters

const EFFECTS = [
  { id: 'none', name: 'Không' },
  { id: 'timestamp', name: 'TimeStamp', icon: '📅' },
  { id: 'lightleak', name: 'Light Leak', icon: '☀️' },
  { id: 'vignette', name: 'Vignette', icon: '🌑' },
  { id: 'grain', name: 'Grain', icon: '🎞️' },
  { id: 'chromatic', name: 'Chromatic', icon: '🌈' },
  { id: 'sparkle', name: 'Lấp Lánh', icon: '✨' },
  { id: 'hearts', name: 'Thả Tim', icon: '💖' },
  { id: 'stars', name: 'Sao Đêm', icon: '⭐' },
  { id: 'neon', name: 'Viền Neon', icon: '⚡' },
  // Adding more abstract effects for variety
  { id: 'bubbles', name: 'Bong Bóng', icon: '🫧' },
  { id: 'snow', name: 'Tuyết Rơi', icon: '❄️' },
  { id: 'fire', name: 'Rực Lửa', icon: '🔥' },
];

function App() {
  const [photoCount, setPhotoCount] = useState(4);
  const [photos, setPhotos] = useState(Array(4).fill(null));
  
  const [captureMode, setCaptureMode] = useState('auto');
  const [videoRecapEnabled, setVideoRecapEnabled] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  
  const [timerDuration, setTimerDuration] = useState(3); // 3s, 5s, 10s
  
  const [currentCat, setCurrentCat] = useState('Tất Cả');
  const [currentFrame, setCurrentFrame] = useState(FRAMES[0]);
  const [currentFilter, setCurrentFilter] = useState(FILTERS[0]);
  const [currentEffect, setCurrentEffect] = useState(EFFECTS[0]);
  
  // Camera & Capture state
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const [countdown, setCountdown] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const stripRef = useRef(null);
  const fileInputRefs = useRef([]);

  // Video Recap Logic
  const startRecording = useCallback(() => {
    if (!videoRecapEnabled) return;
    setRecordedChunks([]);
    if (webcamRef.current && webcamRef.current.stream) {
      try {
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, { mimeType: "video/webm" });
        mediaRecorderRef.current.addEventListener("dataavailable", ({ data }) => {
          if (data.size > 0) setRecordedChunks((prev) => prev.concat(data));
        });
        mediaRecorderRef.current.start();
      } catch (e) { console.error("Video recording error", e); }
    }
  }, [videoRecapEnabled]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
    }
  }, [recordedChunks]);

  const getNextEmptyIndex = () => photos.findIndex(p => p === null);

  // Auto Capture Mode
  const startAutoCapture = () => {
    if (getNextEmptyIndex() === -1) {
      alert("Đã chụp đủ ảnh! Hãy xóa bớt hoặc làm lại để chụp tiếp.");
      return;
    }
    startRecording();
    runAutoCycle();
  };

  const runAutoCycle = () => {
    const nextIdx = getNextEmptyIndex();
    if (nextIdx === -1) {
      stopRecording();
      return; // Done
    }
    setCountdown(timerDuration);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          snapAndSave(nextIdx);
          setTimeout(() => {
            const hasEmpty = photos.findIndex((p, i) => i !== nextIdx && p === null) !== -1;
            if (hasEmpty) runAutoCycle();
            else stopRecording();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Manual Capture Mode
  const handleManualCapture = () => {
    const nextIdx = getNextEmptyIndex();
    if (nextIdx === -1) {
      alert("Đã chụp đủ ảnh!");
      return;
    }
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      startRecording();
    }
    setCountdown(timerDuration);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          snapAndSave(nextIdx);
          if (getNextEmptyIndex() === -1) stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const snapAndSave = (index) => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
        setPhotos(prev => {
          const newPhotos = [...prev];
          newPhotos[index] = imageSrc;
          return newPhotos;
        });
      }
    }
  };

  const handleRetake = () => {
    setPhotos(Array(photoCount).fill(null));
    setVideoUrl(null);
    setRecordedChunks([]);
  };

  const handleSlotUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => {
          const newPhotos = [...prev];
          newPhotos[index] = event.target.result;
          return newPhotos;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPhoto = async () => {
    if (stripRef.current) {
      const canvas = await html2canvas(stripRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `PhotoBoothXinh-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `PhotoBoothXinh-Video-${Date.now()}.webm`;
      a.click();
    }
  };

  const filteredFrames = currentCat === 'Tất Cả' ? FRAMES : FRAMES.filter(f => f.cat === currentCat);
  const takenCount = photos.filter(p => p !== null).length;

  return (
    <div className="app-layout">
      <div className="left-panel">
        <h1 className="main-title">PhotoBooth Xinh</h1>
        <p className="subtitle">Lưu giữ kỉ niệm thật dễ thương</p>

        {/* Layout & Timer Selection */}
        <div className="effects-panel" style={{ marginBottom: '10px', padding: '15px' }}>
          <h3 style={{ margin: 0, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={20}/> Chọn số lượng ảnh
          </h3>
          <div className="pill-list" style={{ marginBottom: '15px' }}>
            {[2, 3, 4, 6, 8].map(num => (
              <button 
                key={num} 
                className={`pill-btn ${photoCount === num ? 'active' : ''}`}
                onClick={() => {
                  setPhotoCount(num);
                  setPhotos(Array(num).fill(null));
                }}
              >
                {num} Ảnh
              </button>
            ))}
          </div>
          
          <h3 style={{ margin: 0, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⏳ Thời gian chờ (giây)
          </h3>
          <div className="pill-list">
            {[3, 5, 10, 15, 20].map(time => (
              <button 
                key={`time-${time}`} 
                className={`pill-btn ${timerDuration === time ? 'active' : ''}`}
                onClick={() => setTimerDuration(time)}
              >
                {time}s
              </button>
            ))}
          </div>
        </div>

        {/* Camera Area */}
        <div className="camera-section">
          <div className="camera-header">
            Đã Chụp {takenCount}/{photoCount}
          </div>
          <div className="camera-wrapper">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className={`camera-feed ${isMirrored ? 'mirror' : ''}`}
              videoConstraints={{ facingMode: facingMode }}
            />
            {countdown > 0 && <div className="countdown-overlay">{countdown}</div>}
            <div className={`flash-overlay ${isFlashing ? 'flash' : ''}`}></div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="main-actions">
          <button className={`action-btn ${captureMode === 'manual' ? 'active' : ''}`} onClick={() => { setCaptureMode('manual'); handleManualCapture(); }}>
            <div className="icon-circle bg-pink"><Hand size={24}/></div>
            <span>Chụp Tay</span>
          </button>
          <button className={`action-btn auto-btn ${captureMode === 'auto' ? 'active' : ''}`} onClick={() => { setCaptureMode('auto'); startAutoCapture(); }}>
            <div className="icon-circle bg-pink-dark"><Camera size={32}/></div>
            <span>AUTO</span>
          </button>
          <button className="action-btn" onClick={handleRetake}>
            <div className="icon-circle bg-green"><RefreshCw size={24}/></div>
            <span>Chụp Lại</span>
          </button>
        </div>

        {/* Toggles */}
        <div className="toggles-section" style={{ flexWrap: 'wrap' }}>
          <label className="toggle-switch-wrapper">
            <input type="checkbox" className="toggle-checkbox" checked={videoRecapEnabled} onChange={(e) => setVideoRecapEnabled(e.target.checked)} />
            <div className="toggle-switch"></div>
            <span>Video Recap</span>
          </label>
          <label className="toggle-switch-wrapper">
            <input type="checkbox" className="toggle-checkbox" checked={isMirrored} onChange={(e) => setIsMirrored(e.target.checked)} />
            <div className="toggle-switch"></div>
            <span>Lật Camera</span>
          </label>
          <label className="toggle-switch-wrapper">
            <input type="checkbox" className="toggle-checkbox" checked={facingMode === 'environment'} onChange={(e) => setFacingMode(e.target.checked ? 'environment' : 'user')} />
            <div className="toggle-switch"></div>
            <span>Cam Sau</span>
          </label>
        </div>

        {/* Filters & Effects */}
        <div className="effects-panel">
          <h3>Bộ lọc màu</h3>
          <div className="pill-list">
            {FILTERS.map(f => (
              <button 
                key={f.id} 
                className={`pill-btn ${currentFilter.id === f.id ? 'active' : ''}`}
                onClick={() => setCurrentFilter(f)}
              >
                {f.name}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: '15px' }}>Hiệu ứng (Chụp Xong Sẽ Thấy)</h3>
          <div className="pill-list">
            {EFFECTS.map(e => (
              <button 
                key={e.id} 
                className={`pill-btn effect-btn ${currentEffect.id === e.id ? 'active' : ''}`}
                onClick={() => setCurrentEffect(e)}
              >
                {e.icon} {e.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - PHOTO STRIP PREVIEW */}
      <div className="right-panel">
        <div className="strip-container">
          <div className="photo-strip" style={currentFrame.style} ref={stripRef}>
            <div className="strip-photos">
              {photos.map((src, i) => (
                <div key={i} className="strip-slot" style={{position: 'relative', overflow: 'hidden'}}>
                  {src ? (
                    <>
                      <img src={src} className="slot-img" style={{ filter: currentFilter.filter }} alt={`slot-${i}`} />
                      {/* Apply Overlay Effects */}
                      {currentEffect.id === 'lightleak' && <div className="effect-overlay lightleak"></div>}
                      {currentEffect.id === 'vignette' && <div className="effect-overlay vignette"></div>}
                      {currentEffect.id === 'grain' && <div className="effect-overlay grain"></div>}
                      {currentEffect.id === 'chromatic' && <div className="effect-overlay chromatic"></div>}
                      {currentEffect.id === 'timestamp' && <div className="timestamp-text">{new Date().toLocaleDateString('vi-VN')}</div>}
                    </>
                  ) : (
                    <div className="empty-slot">
                      <Camera size={30} color="#ccc" />
                      <label className="slot-upload-btn">
                        <Upload size={14} /> Upload
                        <input type="file" accept="image/*" onChange={(e) => handleSlotUpload(i, e)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="strip-footer">PhotoBooth</div>
          </div>
        </div>

        {/* Frames Selection */}
        <div className="frames-selection">
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`tab-btn ${currentCat === cat ? 'active' : ''}`}
                onClick={() => setCurrentCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="frame-options">
            {filteredFrames.map(frame => (
              <div 
                key={frame.id}
                className={`frame-item ${currentFrame.id === frame.id ? 'active' : ''}`}
                style={frame.style}
                onClick={() => setCurrentFrame(frame)}
                title={frame.name}
              >
                <span className="frame-name-badge">{frame.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="export-actions">
          <button className="btn-export primary" onClick={downloadPhoto}>
            <Download size={20} /> Xuất Ảnh Về Máy
          </button>
          <button className="btn-export secondary" onClick={() => setShowQRModal(true)} disabled={!videoUrl}>
            <Video size={20} /> Video Toàn Cảnh (QR)
          </button>
        </div>
      </div>

      {/* QR Modal with explanation */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQRModal(false)}>&times;</button>
            <h2>Video Hậu Trường 🎬</h2>
            <div className="qr-box">
              <QRCodeSVG value="https://photobooth-local.test/video" size={180} fgColor="#ff8fab" />
            </div>
            <p className="qr-warning">
              ⚠️ <strong>Lưu ý về mã QR:</strong><br/>
              Mã QR hiện không quét được bằng điện thoại khác vì App đang chạy trên máy tính cá nhân của bạn (không có máy chủ Internet). Để lấy video về điện thoại, vui lòng bấm nút tải trực tiếp bên dưới rồi gửi qua Zalo/AirDrop nhé!
            </p>
            <button className="btn-export primary" onClick={downloadVideo} style={{ marginTop: '20px', width: '100%' }}>
              <Download size={20} /> Tải Video Trực Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

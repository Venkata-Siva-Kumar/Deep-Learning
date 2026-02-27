import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Layers, ChevronLeft, ChevronRight, Maximize2, Info, BarChart3 } from 'lucide-react';

const OverlayViewer = ({ t1Image, maskImage, onZoom, stats }) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showRawMask, setShowRawMask] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imgBox, setImgBox] = useState({ width: 0, height: 0, top: 0, left: 0 });
  const containerRef = useRef(null);
  const t1Ref = useRef(null);

  useEffect(() => {
    const measureImage = () => {
      if (t1Ref.current && containerRef.current) {
        const t1Rect = t1Ref.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setImgBox({
          width: t1Rect.width,
          height: t1Rect.height,
          top: t1Rect.top - containerRect.top,
          left: t1Rect.left - containerRect.left
        });
      }
    };

    measureImage();
    window.addEventListener('resize', measureImage);
    const timer = setTimeout(measureImage, 100);
    return () => {
      window.removeEventListener('resize', measureImage);
      clearTimeout(timer);
    };
  }, [t1Image]);

  const handleSliderChange = (e) => setSliderPosition(parseInt(e.target.value));

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="w-full">
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40">
            <span className="text-sm font-semibold text-red-400 flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Detected Building Changes</span>
            </span>
          </motion.div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Red areas indicate changes</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {stats?.buildingsDetected && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-800/70">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300"><span className="font-semibold text-white">{stats.buildingsDetected}</span> Buildings</span>
            </div>
          )}
          {stats?.changesFound !== undefined && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-800/70">
              <span className="text-sm text-gray-300"><span className="font-semibold text-white">{stats.changesFound}%</span> Change Area</span>
            </div>
          )}
          {stats?.confidenceScore && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-800/70">
              <span className="text-sm text-gray-300"><span className="font-semibold text-white">{stats.confidenceScore}%</span> Confidence</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <ToggleButton active={showOverlay} onClick={() => setShowOverlay(!showOverlay)} icon={showOverlay ? Eye : EyeOff} label="Show Overlay" />
          <ToggleButton active={showRawMask} onClick={() => setShowRawMask(!showRawMask)} icon={Layers} label="Show Raw Mask" />
        </div>
      </div>

      <motion.div ref={containerRef} className="relative rounded-2xl overflow-hidden border-2 border-gray-700/50 bg-black" style={{ height: '500px' }} whileHover={{ scale: 1.005 }}>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <img ref={t1Ref} src={t1Image} alt="T1" className="max-w-full max-h-full object-contain" draggable={false} />
        </div>

        <AnimatePresence>
          {showOverlay && !showRawMask && imgBox.width > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute pointer-events-none"
              style={{ width: imgBox.width, height: imgBox.height, top: imgBox.top, left: imgBox.left }}
            >
              <img
                src={maskImage}
                alt="Mask"
                className="w-full h-full"
                style={{ filter: 'brightness(2) contrast(1.5)', mixBlendMode: 'screen', objectFit: 'fill' }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-red-500/30 mix-blend-multiply pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRawMask && imgBox.width > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute pointer-events-none"
              style={{ width: imgBox.width, height: imgBox.height, top: imgBox.top, left: imgBox.left }}
            >
              <img src={maskImage} alt="Raw Mask" className="w-full h-full" style={{ opacity: 0.9, objectFit: 'fill' }} draggable={false} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-blue-600/80 text-white text-sm font-medium z-20">
          {showRawMask ? 'Raw Mask' : showOverlay ? 'With Changes' : 'T1 Image'}
        </div>

        <div className="absolute inset-0 overflow-hidden z-10" style={{ width: `${sliderPosition}%` }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ width: `${10000 / Math.max(sliderPosition, 1)}%` }}>
            <img src={t1Image} alt="Original" className="max-w-full max-h-full object-contain" draggable={false} />
          </div>
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gray-900/70 text-white text-sm font-medium z-30">Original T1</div>
        </div>

        <div className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none" style={{ left: `${sliderPosition}%` }} />

        <motion.div className="absolute top-0 bottom-0 z-30 cursor-ew-resize" style={{ left: `calc(${sliderPosition}% - 20px)`, width: '40px' }} onMouseEnter={() => setIsDragging(true)} onMouseLeave={() => setIsDragging(false)}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center" animate={{ boxShadow: isDragging ? '0 0 30px rgba(255,255,255,0.9)' : '0 4px 20px rgba(0,0,0,0.3)' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <ChevronLeft className="w-4 h-4 text-gray-700" />
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </motion.div>
          </div>
        </motion.div>

        <input type="range" min="0" max="100" value={sliderPosition} onChange={handleSliderChange} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40" />

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onZoom(); }} className="absolute bottom-4 right-4 p-3 rounded-full bg-gray-900/70 text-white hover:bg-gray-800/90 z-50">
          <Maximize2 className="w-5 h-5" />
        </motion.button>

        <div className="absolute bottom-4 left-4 flex items-center space-x-4 z-50">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-900/70">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-white">Building Changes</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-900/70">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span className="text-xs text-white">No Change</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-center space-x-4">
        <span className="text-sm text-gray-500">Original</span>
        <div className="flex-1 max-w-md h-2 bg-gray-700 rounded-full relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full" style={{ width: `${sliderPosition}%` }} />
          <div className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-gray-600" style={{ left: `calc(${sliderPosition}% - 8px)`, transform: 'translateY(-50%)' }} />
        </div>
        <span className="text-sm text-gray-500">{sliderPosition}%</span>
      </div>
    </motion.div>
  );
};

const ToggleButton = ({ active, onClick, icon: Icon, label }) => (
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </motion.button>
);

export default OverlayViewer;

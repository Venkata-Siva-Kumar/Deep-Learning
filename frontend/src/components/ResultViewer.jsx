import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download, Layers, Eye, ChevronLeft, ChevronRight, GitCompare } from 'lucide-react';
import OverlayViewer from './OverlayViewer';

const ResultViewer = ({ result, onClose }) => {
  const [activeView, setActiveView] = useState('all');
  const [zoomedImage, setZoomedImage] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showSlider, setShowSlider] = useState(false);

  // Demo data - replace with actual API response
  const images = {
    t1: result?.t1Image || '/api/placeholder/400/320',
    t2: result?.t2Image || '/api/placeholder/400/320',
    mask: result?.changeMask || '/api/placeholder/400/320',
  };

  const viewOptions = [
    { id: 'all', label: 'All Views', icon: Layers },
    { id: 'overlay', label: 'Overlay View', icon: GitCompare },
    { id: 't1', label: 'T1 Image', icon: Eye },
    { id: 't2', label: 'T2 Image', icon: Eye },
    { id: 'mask', label: 'Change Mask', icon: Eye },
    { id: 'compare', label: 'Compare', icon: ChevronLeft },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
              <p className="text-sm text-gray-400">Change detection completed successfully</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View toggle buttons */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
                {viewOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveView(option.id);
                      setShowSlider(option.id === 'compare');
                    }}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        activeView === option.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Download button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </motion.button>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* T1 Image */}
              <ResultCard
                title="T1 Satellite Image"
                subtitle="Baseline temporal data"
                image={images.t1}
                color="blue"
                onZoom={() => setZoomedImage(images.t1)}
              />

              {/* T2 Image */}
              <ResultCard
                title="T2 Satellite Image"
                subtitle="Current temporal data"
                image={images.t2}
                color="purple"
                onZoom={() => setZoomedImage(images.t2)}
              />

              {/* Change Mask */}
              <ResultCard
                title="Change Mask"
                subtitle="Detected building changes"
                image={images.mask}
                color="green"
                onZoom={() => setZoomedImage(images.mask)}
                isHighlighted
              />
            </motion.div>
          )}

          {activeView === 't1' && (
            <SingleView
              key="t1"
              image={images.t1}
              title="T1 Satellite Image"
              color="blue"
              onZoom={() => setZoomedImage(images.t1)}
            />
          )}

          {activeView === 't2' && (
            <SingleView
              key="t2"
              image={images.t2}
              title="T2 Satellite Image"
              color="purple"
              onZoom={() => setZoomedImage(images.t2)}
            />
          )}

          {activeView === 'mask' && (
            <SingleView
              key="mask"
              image={images.mask}
              title="Change Detection Mask"
              color="green"
              onZoom={() => setZoomedImage(images.mask)}
            />
          )}

          {activeView === 'overlay' && (
            <OverlayView
              key="overlay"
              t1Image={images.t1}
              maskImage={images.mask}
              stats={result?.stats}
              onZoom={() => setZoomedImage(images.t1)}
            />
          )}

          {activeView === 'compare' && (
            <CompareView
              key="compare"
              t1Image={images.t1}
              t2Image={images.t2}
              sliderPosition={sliderPosition}
              setSliderPosition={setSliderPosition}
            />
          )}
        </AnimatePresence>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard label="Buildings Detected" value={result?.stats?.buildingsDetected || '-'} color="blue" />
          <StatCard label="Changes Found" value={`${result?.stats?.changesFound || '-'}%`} color="green" />
          <StatCard label="Confidence Score" value={`${result?.stats?.confidenceScore || '-'}%`} color="purple" />
          <StatCard label="Processing Time" value={`${result?.stats?.processingTime || '-'}s`} color="pink" />
        </motion.div>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={zoomedImage}
              alt="Zoomed view"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Result Card Component
const ResultCard = ({ title, subtitle, image, color, onZoom, isHighlighted }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`
        relative rounded-2xl overflow-hidden
        bg-gradient-to-br ${colorClasses[color]}
        border-2 ${isHighlighted ? 'ring-2 ring-green-400/50' : ''}
        transition-all duration-300
      `}
    >
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="relative group" style={{ minHeight: '200px' }}>
        <img
          src={image}
          alt={title}
          className="w-full h-auto max-h-[300px] object-contain bg-black/30"
        />
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={onZoom}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Single View Component
const SingleView = ({ image, title, color, onZoom }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="max-w-4xl mx-auto"
  >
    <div className={`rounded-2xl overflow-hidden border-2 border-${color}-500/30`}>
      <div className="p-4 bg-gray-800/50 border-b border-white/10">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="relative group">
        <div className="w-full flex items-center justify-center bg-black/30" style={{ minHeight: '400px' }}>
          <img src={image} alt={title} className="max-w-full max-h-[70vh] object-contain" />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={onZoom}
          className="absolute top-4 right-4 p-3 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ZoomIn className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// Overlay View Component
const OverlayView = ({ t1Image, maskImage, onZoom, stats }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="max-w-5xl mx-auto"
  >
    <OverlayViewer t1Image={t1Image} maskImage={maskImage} onZoom={onZoom} stats={stats} />
  </motion.div>
);

// Compare View Component
const CompareView = ({ t1Image, t2Image, sliderPosition, setSliderPosition }) => {
  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="rounded-2xl overflow-hidden border-2 border-blue-500/30">
        <div className="p-4 bg-gray-800/50 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Before / After Comparison</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Drag slider to compare</span>
          </div>
        </div>
        <div className="relative h-[60vh] overflow-hidden">
          {/* T2 Image (Background) */}
          <img
            src={t2Image}
            alt="After"
            className="absolute inset-0 w-full h-full object-contain bg-black/30"
          />
          
          {/* T1 Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={t1Image}
              alt="Before"
              className="absolute inset-0 w-full h-full object-contain bg-black/30"
              style={{ width: `${100 / (sliderPosition / 100)}%` }}
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-gray-800 -mr-1" />
              <ChevronRight className="w-4 h-4 text-gray-800 -ml-1" />
            </div>
          </div>

          {/* Slider input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
        </div>
        
        {/* Labels */}
        <div className="p-4 bg-gray-800/50 flex justify-between text-sm">
          <span className="text-blue-400 font-medium">T1 (Before)</span>
          <span className="text-purple-400 font-medium">T2 (After)</span>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    pink: 'text-pink-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded-xl glass-morphism border border-white/10"
    >
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
    </motion.div>
  );
};

export default ResultViewer;

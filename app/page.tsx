'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Sun, 
  Settings, 
  Zap, 
  Layout, 
  Cpu, 
  Thermometer, 
  ArrowRight, 
  Menu, 
  X, 
  Globe, 
  Moon,
  Info,
  Maximize2,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

// --- Components ---

const CustomTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block w-full" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[110] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl border border-white/10 w-48 pointer-events-none text-center"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-6 max-w-sm w-full bg-white dark:bg-slate-900"
      >
        <h3 className="text-lg font-bold mb-4">{message}</h3>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-3 flex items-center justify-between backdrop-blur-md bg-opacity-80"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 accent-bg rounded-lg flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight">Ubden®</h1>
          <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Solar FX v1.0.1</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium hover:accent-text transition-colors">{t('nav.dashboard')}</a>
        <a href="#" className="text-sm font-medium hover:accent-text transition-colors">{t('nav.projects')}</a>
        <a href="#" className="text-sm font-medium hover:accent-text transition-colors">{t('nav.engineering')}</a>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Switch Language"
        >
          <Globe size={18} />
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card p-6 flex flex-col gap-4 md:hidden"
          >
            <a href="#" className="text-lg font-medium">{t('nav.dashboard')}</a>
            <a href="#" className="text-lg font-medium">{t('nav.projects')}</a>
            <a href="#" className="text-lg font-medium">{t('nav.engineering')}</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

const SolarCanvas = ({ 
  panelType, 
  inverterType, 
  panels, 
  setPanels, 
  exportData, 
  layoutWidth, 
  setLayoutWidth, 
  layoutHeight, 
  setLayoutHeight, 
  panelSize, 
  setPanelSize,
  angle,
  azimuth
}: any) => {
  const { t } = useLanguage()
  const [showConfirm, setShowConfirm] = useState(false)
  const [is3D, setIs3D] = useState(true)
  const [sceneRotateX, setSceneRotateX] = useState(25)
  const [sceneRotateY, setSceneRotateY] = useState(-5)
  const [sceneRotateZ, setSceneRotateZ] = useState(0)
  const [sceneScale, setSceneScale] = useState(0.85)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [isColliding, setIsColliding] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const orbitRef = React.useRef<{ x: number, y: number } | null>(null)
  const gridStep = 20
  const snapThreshold = 10

  const getPanelDims = (size: string) => {
    switch (size) {
      case 'small': return { w: 40, h: 64 }
      case 'large': return { w: 80, h: 120 }
      default: return { w: 64, h: 96 }
    }
  }

  const { w: panelW, h: panelH } = getPanelDims(panelSize)

  const checkCollision = (id: number, x: number, y: number, w: number, h: number) => {
    return panels.some((p: any) => {
      if (p.id === id) return false
      const pw = getPanelDims(panelSize).w
      const ph = getPanelDims(panelSize).h
      return (
        x < p.x + pw &&
        x + w > p.x &&
        y < p.y + ph &&
        y + h > p.y
      )
    })
  }

  const addPanel = () => {
    if (panels.length < 48) {
      // Find a free spot
      let newX = 40
      let newY = 40
      let found = false
      
      for (let r = 0; r < 10 && !found; r++) {
        for (let c = 0; c < 10 && !found; c++) {
          const tx = 40 + c * (panelW + 10)
          const ty = 40 + r * (panelH + 10)
          if (!checkCollision(-1, tx, ty, panelW, panelH)) {
            newX = tx
            newY = ty
            found = true
          }
        }
      }

      setPanels([...panels, { id: Date.now(), x: newX, y: newY, rotation: 0 }])
    }
  }

  const handleClear = () => {
    setShowConfirm(true)
  }

  const confirmClear = () => {
    setPanels([])
    setShowConfirm(false)
  }

  const rotatePanel = (id: number) => {
    setPanels(panels.map((p: any) => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
  }

  const updatePanelPos = (id: number, x: number, y: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    let finalX = x
    let finalY = y

    // 1. Snap to other panels
    panels.forEach((other: any) => {
      if (other.id === id) return

      const otherW = getPanelDims(panelSize).w
      const otherH = getPanelDims(panelSize).h

      // Horizontal snapping
      if (Math.abs(x - (other.x + otherW)) < snapThreshold) finalX = other.x + otherW
      if (Math.abs((x + panelW) - other.x) < snapThreshold) finalX = other.x - panelW
      if (Math.abs(x - other.x) < snapThreshold) finalX = other.x

      // Vertical snapping
      if (Math.abs(y - (other.y + otherH)) < snapThreshold) finalY = other.y + otherH
      if (Math.abs((y + panelH) - other.y) < snapThreshold) finalY = other.y - panelH
      if (Math.abs(y - other.y) < snapThreshold) finalY = other.y
    })

    // 2. Snap to grid if not snapped to panel
    if (finalX === x) finalX = Math.round(x / gridStep) * gridStep
    if (finalY === y) finalY = Math.round(y / gridStep) * gridStep
    
    // 3. Constrain to canvas
    finalX = Math.max(0, Math.min(finalX, rect.width - panelW))
    finalY = Math.max(0, Math.min(finalY, rect.height - panelH))

    // 4. Collision check - if colliding, don't move or find closest free spot
    // For simplicity in drag, we allow movement but highlight or snap back if invalid
    // Here we'll just prevent the move if it's a hard collision at the end of drag
    if (checkCollision(id, finalX, finalY, panelW, panelH)) {
      // If colliding, we can either revert or find nearest free. 
      // Reverting is safer for UX during drag end.
      return 
    }

    setPanels(panels.map((p: any) => p.id === id ? { ...p, x: finalX, y: finalY } : p))
  }

  const canvasScale = 40 // 40px per meter
  const canvasW = layoutWidth * canvasScale
  const canvasH = layoutHeight * canvasScale

  // 3D Controls Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsOrbiting(true)
      orbitRef.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isOrbiting && orbitRef.current) {
      const deltaX = e.clientX - orbitRef.current.x
      const deltaY = e.clientY - orbitRef.current.y
      
      setSceneRotateY(prev => (prev + deltaX * 0.5) % 360)
      setSceneRotateX(prev => Math.max(0, Math.min(90, prev - deltaY * 0.5)))
      
      orbitRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    setIsOrbiting(false)
    orbitRef.current = null
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (is3D) {
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      setSceneScale(prev => Math.max(0.2, Math.min(2, prev + delta)))
    }
  }

  useEffect(() => {
    if (isOrbiting) {
      window.addEventListener('mouseup', handleMouseUp)
      return () => window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isOrbiting])

  return (
    <div 
      className="glass-card p-6 flex flex-col gap-6 h-full min-h-[700px]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      {/* Top Controls - Moved here as requested */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase opacity-60 block">{t('layout.panel_size')}</label>
          <div className="grid grid-cols-3 gap-1">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => setPanelSize(size)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${panelSize === size ? 'accent-bg text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
              >
                {t(`panel.${size}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase opacity-60 block">{t('layout.dimensions')} (m)</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input 
                type="number" 
                value={layoutWidth || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLayoutWidth(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:accent-border pl-7"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] opacity-40 font-mono">W</span>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={layoutHeight || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLayoutHeight(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:accent-border pl-7"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] opacity-40 font-mono">H</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2">
           <button 
            onClick={() => setIs3D(!is3D)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${is3D ? 'accent-bg text-white' : 'bg-black/5 dark:bg-white/5'}`}
          >
            <Maximize2 size={14} />
            {is3D ? '3D VIEW ON' : '2D VIEW'}
          </button>
          <button 
            onClick={addPanel}
            className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            {t('tooltip.add_panel')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layout className="accent-text" size={20} />
            <h2 className="font-display font-bold">{t('layout.title')}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono opacity-60">
            <span>{layoutWidth}m x {layoutHeight}m</span>
            <span className="w-1 h-1 rounded-full bg-current"></span>
            <span>{panels.length} Panels</span>
          </div>
        </div>
        
        {is3D && (
          <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-border shadow-inner">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-mono uppercase opacity-50">Pitch (X)</label>
                <span className="text-[8px] font-mono accent-text">{sceneRotateX}°</span>
              </div>
              <input 
                type="range" min="0" max="90" value={sceneRotateX} 
                onChange={(e) => setSceneRotateX(parseInt(e.target.value))}
                className="w-20 h-1 accent-bg cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-mono uppercase opacity-50">Yaw (Y)</label>
                <span className="text-[8px] font-mono accent-text">{sceneRotateY}°</span>
              </div>
              <input 
                type="range" min="-180" max="180" value={sceneRotateY} 
                onChange={(e) => setSceneRotateY(parseInt(e.target.value))}
                className="w-20 h-1 accent-bg cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-mono uppercase opacity-50">Roll (Z)</label>
                <span className="text-[8px] font-mono accent-text">{sceneRotateZ}°</span>
              </div>
              <input 
                type="range" min="-180" max="180" value={sceneRotateZ} 
                onChange={(e) => setSceneRotateZ(parseInt(e.target.value))}
                className="w-20 h-1 accent-bg cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-mono uppercase opacity-50">Zoom</label>
                <span className="text-[8px] font-mono accent-text">{(sceneScale * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0.2" max="2" step="0.05" value={sceneScale} 
                onChange={(e) => setSceneScale(parseFloat(e.target.value))}
                className="w-20 h-1 accent-bg cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <CustomTooltip content={t('tooltip.export')}>
            <button 
              onClick={exportData}
              className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:accent-bg hover:text-white transition-all w-10 h-10 flex items-center justify-center"
            >
              <ArrowRight size={18} className="-rotate-45" />
            </button>
          </CustomTooltip>
          <CustomTooltip content={t('tooltip.clear_all')}>
            <button 
              onClick={handleClear}
              className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-all w-10 h-10 flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
          </CustomTooltip>
        </div>
      </div>

      <div 
        className="flex-1 relative bg-black/5 dark:bg-white/5 rounded-xl border-2 border-dashed border-border overflow-hidden cursor-crosshair p-12"
        style={{ perspective: is3D ? '1200px' : 'none' }}
      >
        <motion.div 
          ref={containerRef}
          style={{ 
            width: canvasW, 
            height: canvasH,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: is3D ? sceneRotateX : 0,
            rotateY: is3D ? sceneRotateY : 0,
            rotateZ: is3D ? sceneRotateZ : 0,
            scale: is3D ? sceneScale : 1
          }}
          className="relative bg-white dark:bg-slate-900 shadow-2xl mx-auto border border-border transition-all duration-700 ease-in-out"
        >
          {/* 3D Base Thickness */}
          {is3D && (
            <>
              {/* Bottom thickness */}
              <div 
                className="absolute bottom-0 left-0 w-full h-[20px] bg-slate-400 dark:bg-slate-800 border-b border-border" 
                style={{ transform: 'rotateX(90deg) translateY(10px)', transformOrigin: 'bottom' }}
              ></div>
              {/* Right thickness */}
              <div 
                className="absolute top-0 right-0 h-full w-[20px] bg-slate-300 dark:bg-slate-700 border-r border-border" 
                style={{ transform: 'rotateY(90deg) translateX(10px)', transformOrigin: 'right' }}
              ></div>
              {/* Left thickness */}
              <div 
                className="absolute top-0 left-0 h-full w-[20px] bg-slate-500 dark:bg-slate-950 border-l border-border" 
                style={{ transform: 'rotateY(-90deg) translateX(-10px)', transformOrigin: 'left' }}
              ></div>
            </>
          )}

          {/* Grid Background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: `${gridStep}px ${gridStep}px` }}>
          </div>

          <div className="w-full h-full p-0 relative" style={{ transformStyle: 'preserve-3d' }}>
            <AnimatePresence mode="popLayout">
              {panels.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  dragConstraints={containerRef}
                  onDragStart={() => setDraggedId(p.id)}
                  onDrag={(e, info) => {
                    if (!containerRef.current) return
                    const rect = containerRef.current.getBoundingClientRect()
                    const currentX = p.x + info.offset.x
                    const currentY = p.y + info.offset.y
                    
                    // Boundary check for visual feedback
                    const outOfBounds = currentX < 0 || currentX + panelW > rect.width || currentY < 0 || currentY + panelH > rect.height
                    const colliding = checkCollision(p.id, currentX, currentY, panelW, panelH)
                    setIsColliding(outOfBounds || colliding)
                  }}
                  onDragEnd={(_, info) => {
                    setDraggedId(null)
                    setIsColliding(false)
                    updatePanelPos(p.id, p.x + info.offset.x, p.y + info.offset.y)
                  }}
                  initial={{ opacity: 0, scale: 0.5, translateZ: 100 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: 0, 
                    y: 0,
                    rotateZ: p.rotation,
                    rotateX: is3D ? -angle : 0, // Tilt effect
                    translateZ: is3D ? 20 : 0,
                    left: p.x,
                    top: p.y,
                    width: panelW,
                    height: panelH,
                    borderColor: (draggedId === p.id && isColliding) ? '#ef4444' : (panelType === 'mono' ? '#334155' : '#1d4ed8')
                  }}
                  exit={{ opacity: 0, scale: 0.5, translateZ: -100 }}
                  whileHover={{ scale: 1.05, translateZ: 40, zIndex: 40 }}
                  whileDrag={{ scale: 1.1, zIndex: 50, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)" }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`absolute rounded-sm border-2 ${panelType === 'mono' ? 'bg-slate-800 border-slate-700' : 'bg-blue-800 border-blue-700'} shadow-lg cursor-grab active:cursor-grabbing group transition-colors duration-300`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* 3D Sides */}
                  {is3D && (
                    <>
                      {/* Top Side */}
                      <div 
                        className="absolute top-0 left-0 w-full h-[6px] bg-slate-600/80 border-t border-white/10" 
                        style={{ transform: 'rotateX(-90deg) translateY(-3px)', transformOrigin: 'top' }}
                      ></div>
                      {/* Right Side */}
                      <div 
                        className="absolute top-0 right-0 h-full w-[6px] bg-slate-700/80 border-r border-white/10" 
                        style={{ transform: 'rotateY(90deg) translateX(3px)', transformOrigin: 'right' }}
                      ></div>
                      {/* Bottom Side */}
                      <div 
                        className="absolute bottom-0 left-0 w-full h-[6px] bg-slate-900/80 border-b border-white/10" 
                        style={{ transform: 'rotateX(90deg) translateY(3px)', transformOrigin: 'bottom' }}
                      ></div>
                      {/* Left Side */}
                      <div 
                        className="absolute top-0 left-0 h-full w-[6px] bg-slate-900/80 border-l border-white/10" 
                        style={{ transform: 'rotateY(-90deg) translateX(-3px)', transformOrigin: 'left' }}
                      ></div>
                    </>
                  )}

                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 gap-[1px] opacity-30">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className="border-[0.5px] border-white/20"></div>
                    ))}
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  
                  {/* Rotation Handle */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); rotatePanel(p.id); }}
                    className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:scale-110 active:scale-95"
                  >
                    <RefreshCw size={12} className="accent-text" />
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setPanels(panels.filter((panel: any) => panel.id !== p.id));
                    }}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:scale-110 active:scale-95"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {panels.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 gap-2">
                <Layout size={48} strokeWidth={1} />
                <p className="text-sm">{t('layout.add')}...</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Inverter Visualization */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3 z-20">
          <div className="text-right">
            <p className="text-[10px] uppercase font-mono opacity-60">{inverterType}</p>
            <p className="text-xs font-bold accent-text">ACTIVE</p>
          </div>
          <div className="w-12 h-12 glass-card flex items-center justify-center bg-slate-900 border-slate-700">
            <Cpu className="text-emerald-500" size={24} />
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        onConfirm={confirmClear}
        onCancel={() => setShowConfirm(false)}
        message={t('layout.confirm_clear')}
      />
    </div>
  )
}

const brandPresets = [
  { name: 'Jinko Solar', tempCoeff: -0.35, soiling: 2.0, mismatch: 1.5, dcOhmic: 1.0, shading: 3.0, inverterEff: 97.5, voltage: 850, current: 12.5 },
  { name: 'Longi Solar', tempCoeff: -0.34, soiling: 1.8, mismatch: 1.2, dcOhmic: 0.8, shading: 2.5, inverterEff: 98.0, voltage: 840, current: 12.2 },
  { name: 'Huawei Smart', tempCoeff: -0.30, soiling: 1.5, mismatch: 1.0, dcOhmic: 0.5, shading: 2.0, inverterEff: 98.5, voltage: 860, current: 13.0 },
]

const ConfigPanel = ({ 
  panelType, setPanelType, 
  inverterType, setInverterType, 
  angle, setAngle, 
  azimuth, setAzimuth,
  degradation, setDegradation,
  weather, setWeather,
  engineeringParams, setEngineeringParams
}: any) => {
  const { t } = useLanguage()

  const applyPreset = (preset: any) => {
    setEngineeringParams({
      ...engineeringParams,
      tempCoeff: preset.tempCoeff,
      soiling: preset.soiling,
      mismatch: preset.mismatch,
      dcOhmic: preset.dcOhmic,
      shading: preset.shading,
      inverterEff: preset.inverterEff,
      systemVoltage: preset.voltage,
      operatingCurrent: preset.current,
    })
  }

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Settings className="accent-text" size={20} />
        <h2 className="font-display font-bold">{t('nav.engineering')}</h2>
      </div>

      <div className="space-y-4">
        <CustomTooltip content={t('tooltip.panel_type')}>
          <label className="text-xs font-mono uppercase opacity-60 mb-2 block">{t('config.panel_type')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setPanelType('mono')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${panelType === 'mono' ? 'accent-bg text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
            >
              {t('panel.mono')}
            </button>
            <button 
              onClick={() => setPanelType('poly')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${panelType === 'poly' ? 'accent-bg text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
            >
              {t('panel.poly')}
            </button>
          </div>
        </CustomTooltip>

        <CustomTooltip content={t('tooltip.inverter')}>
          <label className="text-xs font-mono uppercase opacity-60 mb-2 block">{t('config.inverter_type')}</label>
          <select 
            value={inverterType}
            onChange={(e) => setInverterType(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:accent-border"
          >
            <option value="string">{t('inverter.string')}</option>
            <option value="micro">{t('inverter.micro')}</option>
            <option value="hybrid">{t('inverter.hybrid')}</option>
          </select>
        </CustomTooltip>

        <CustomTooltip content={t('tooltip.angle')}>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase opacity-60">{t('config.angle')}</label>
            <span className="text-xs font-bold accent-text">{angle || 0}°</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="90" 
            value={angle || 0}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full accent-bg"
          />
        </CustomTooltip>

        <CustomTooltip content={t('tooltip.azimuth')}>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase opacity-60">{t('config.azimuth')}</label>
            <span className="text-xs font-bold accent-text">{azimuth || 0}°</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={azimuth || 0}
            onChange={(e) => setAzimuth(parseInt(e.target.value))}
            className="w-full accent-bg"
          />
        </CustomTooltip>

        <CustomTooltip content={t('tooltip.degradation')}>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase opacity-60">{t('config.degradation')}</label>
            <span className="text-xs font-bold accent-text">{degradation || 0}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.1"
            value={degradation || 0}
            onChange={(e) => setDegradation(parseFloat(e.target.value))}
            className="w-full accent-bg"
          />
        </CustomTooltip>

        <CustomTooltip content={t('tooltip.weather')}>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase opacity-60">{t('config.weather')}</label>
            <span className="text-xs font-bold accent-text">{weather || 0}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={weather || 0}
            onChange={(e) => setWeather(parseInt(e.target.value))}
            className="w-full accent-bg"
          />
        </CustomTooltip>
      </div>
    </div>
  )
}

const StatsDisplay = ({ panels, angle, panelType, degradation, weather, engineeringParams, panelSize }: any) => {
  const { t } = useLanguage()
  
  // Enhanced calculations
  const panelWatts = panelSize === 'small' ? 300 : panelSize === 'medium' ? 450 : 600
  const baseEfficiency = panelType === 'mono' ? 0.22 : 0.18
  const angleFactor = Math.cos((Math.abs((angle || 0) - 30) * Math.PI) / 180)
  const weatherFactor = (weather || 0) / 100
  const degradationFactor = 1 - ((degradation || 0) / 100)
  const systemLossFactor = 1 - (((engineeringParams.soiling || 0) + (engineeringParams.mismatch || 0) + (engineeringParams.dcOhmic || 0) + (engineeringParams.shading || 0) + (100 - (engineeringParams.inverterEff || 100))) / 100)
  
  const rawCapacity = (panels.length * panelWatts * baseEfficiency * angleFactor * weatherFactor * degradationFactor * systemLossFactor)
  const capacity = isNaN(rawCapacity) ? "0.0" : rawCapacity.toFixed(1)
  const efficiency = isNaN(rawCapacity) ? "0.0" : (baseEfficiency * angleFactor * weatherFactor * degradationFactor * systemLossFactor * 100).toFixed(1)
  const dailyOutput = isNaN(rawCapacity) ? "0.0" : (parseFloat(capacity) * 5.5).toFixed(1)

  const chartData = [
    { time: '06:00', power: 0 },
    { time: '08:00', power: (parseFloat(capacity) || 0) * 0.2 },
    { time: '10:00', power: (parseFloat(capacity) || 0) * 0.6 },
    { time: '12:00', power: (parseFloat(capacity) || 0) * 1.0 },
    { time: '14:00', power: (parseFloat(capacity) || 0) * 0.9 },
    { time: '16:00', power: (parseFloat(capacity) || 0) * 0.5 },
    { time: '18:00', power: (parseFloat(capacity) || 0) * 0.1 },
    { time: '20:00', power: 0 },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-default">
        <div className="flex items-center gap-2 opacity-60 mb-4">
          <Zap size={16} />
          <span className="text-xs font-mono uppercase">{t('stats.capacity')}</span>
        </div>
        <div>
          <motion.span 
            key={capacity}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-display font-bold"
          >
            {capacity}
          </motion.span>
          <span className="text-sm font-mono ml-2 opacity-60">kWp</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-default">
        <div className="flex items-center gap-2 opacity-60 mb-4">
          <RefreshCw size={16} />
          <span className="text-xs font-mono uppercase">{t('stats.efficiency')}</span>
        </div>
        <div>
          <motion.span 
            key={efficiency}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-display font-bold"
          >
            {efficiency}
          </motion.span>
          <span className="text-sm font-mono ml-2 opacity-60">%</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-default">
        <div className="flex items-center gap-2 opacity-60 mb-4">
          <ArrowRight size={16} />
          <span className="text-xs font-mono uppercase">{t('stats.output')}</span>
        </div>
        <div>
          <motion.span 
            key={dailyOutput}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-display font-bold"
          >
            {dailyOutput}
          </motion.span>
          <span className="text-sm font-mono ml-2 opacity-60">kWh/d</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="md:col-span-3 glass-card p-6 h-[300px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider opacity-60">Power Generation Curve</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full accent-bg"></div>
            <span className="text-[10px] font-mono">Real-time Simulation</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="power" 
              stroke="var(--accent)" 
              fillOpacity={1} 
              fill="url(#colorPower)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}

const SunPathAnimation = ({ angle, azimuth }: any) => {
  const { t } = useLanguage()
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <Sun className="accent-text" size={20} />
        <h2 className="font-display font-bold">Sun Position & Angles</h2>
      </div>
      <div className="relative h-48 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
        {/* Compass */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-32 h-32 border-2 border-current rounded-full flex items-center justify-center">
            <span className="absolute top-1 font-mono text-[10px]">N</span>
            <span className="absolute bottom-1 font-mono text-[10px]">S</span>
            <span className="absolute left-1 font-mono text-[10px]">W</span>
            <span className="absolute right-1 font-mono text-[10px]">E</span>
          </div>
        </div>

        {/* Sun Path */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <path 
            d="M 20 150 Q 150 20 280 150" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            className="opacity-20"
          />
          <motion.circle
            cx="150"
            cy="85"
            r="12"
            fill="var(--accent)"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              cx: 150 + Math.sin(((azimuth || 0) * Math.PI) / 180) * 50,
              cy: 85 - Math.cos(((angle || 0) * Math.PI) / 180) * 30
            }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          />
        </svg>

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full accent-bg"></div>
            <span className="text-[10px] font-mono uppercase opacity-60">Tilt: {angle}°</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-mono uppercase opacity-60">Azimuth: {azimuth}°</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const EngineeringDetails = ({ engineeringParams, setEngineeringParams }: any) => {
  const { t } = useLanguage()
  
  const applyPreset = (preset: any) => {
    setEngineeringParams({
      ...engineeringParams,
      tempCoeff: preset.tempCoeff,
      soiling: preset.soiling,
      mismatch: preset.mismatch,
      dcOhmic: preset.dcOhmic,
      shading: preset.shading,
      inverterEff: preset.inverterEff,
      systemVoltage: preset.voltage,
      operatingCurrent: preset.current,
    })
  }

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <h3 className="font-display font-bold flex items-center gap-2">
        <Cpu size={18} className="accent-text" />
        {t('engineering.details')}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-mono uppercase opacity-60 mb-2 block">{t('engineering.presets')}</label>
          <div className="flex flex-wrap gap-2">
            {brandPresets.map((brand) => (
              <button
                key={brand.name}
                onClick={() => applyPreset(brand)}
                className="text-[10px] px-2 py-1 rounded bg-black/5 dark:bg-white/5 hover:accent-bg hover:text-white transition-all border border-border"
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('engineering.voltage')} (V)</label>
            <input
              type="number"
              value={engineeringParams.systemVoltage || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEngineeringParams({ ...engineeringParams, systemVoltage: isNaN(val) ? 0 : val });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('engineering.current')} (A)</label>
            <input
              type="number"
              step="0.1"
              value={engineeringParams.operatingCurrent || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEngineeringParams({ ...engineeringParams, operatingCurrent: isNaN(val) ? 0 : val });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('engineering.temp')} (°C)</label>
            <input
              type="number"
              value={engineeringParams.cellTemp || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEngineeringParams({ ...engineeringParams, cellTemp: isNaN(val) ? 0 : val });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('engineering.temp_coeff')}</label>
            <input
              type="number"
              step="0.01"
              value={engineeringParams.tempCoeff || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEngineeringParams({ ...engineeringParams, tempCoeff: isNaN(val) ? 0 : val });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <label className="text-[10px] font-mono uppercase opacity-60 mb-2 block">Loss Parameters (%)</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <label className="text-[9px] opacity-60 block">{t('engineering.soiling')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={engineeringParams.soiling || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEngineeringParams({ ...engineeringParams, soiling: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] opacity-60 block">{t('engineering.mismatch')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={engineeringParams.mismatch || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEngineeringParams({ ...engineeringParams, mismatch: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] opacity-60 block">{t('engineering.shading')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={engineeringParams.shading || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEngineeringParams({ ...engineeringParams, shading: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] opacity-60 block">{t('engineering.dc_ohmic')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={engineeringParams.dcOhmic || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEngineeringParams({ ...engineeringParams, dcOhmic: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] opacity-60 block">{t('engineering.inverter_eff')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={engineeringParams.inverterEff || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEngineeringParams({ ...engineeringParams, inverterEff: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FinancialPanel = ({ financialParams, setFinancialParams, dailyOutput }: any) => {
  const { t } = useLanguage()
  
  const dailySavingsRaw = (dailyOutput || 0) * (financialParams.unitPrice || 0)
  const dailySavings = isNaN(dailySavingsRaw) ? "0.00" : dailySavingsRaw.toFixed(2)
  const yearlySavings = isNaN(dailySavingsRaw) ? "0.00" : (dailySavingsRaw * 365).toFixed(2)
  const dailyConsumption = (financialParams.monthlyConsumption || 0) / 30
  const coverageRaw = dailyConsumption > 0 ? ((dailyOutput / dailyConsumption) * 100) : 0
  const coverage = isNaN(coverageRaw) ? "0.0" : coverageRaw.toFixed(1)

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <h3 className="font-display font-bold flex items-center gap-2">
        <Globe size={18} className="accent-text" />
        {t('financial.title')}
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('financial.unit_price')}</label>
            <input
              type="number"
              step="0.01"
              value={financialParams.unitPrice || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFinancialParams({ ...financialParams, unitPrice: isNaN(val) ? 0 : val });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('financial.currency')}</label>
            <select
              value={financialParams.currency}
              onChange={(e) => setFinancialParams({ ...financialParams, currency: e.target.value })}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
            >
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="₺">₺ TRY</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase opacity-60 mb-1 block">{t('financial.consumption')} (kWh)</label>
          <input
            type="number"
            value={financialParams.monthlyConsumption || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setFinancialParams({ ...financialParams, monthlyConsumption: isNaN(val) ? 0 : val });
            }}
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded p-1 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="opacity-60">{t('financial.savings_daily')}</span>
            <span className="font-bold accent-text">{dailySavings} {financialParams.currency}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="opacity-60">{t('financial.savings_yearly')}</span>
            <span className="font-bold accent-text">{yearlySavings} {financialParams.currency}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="opacity-60">{t('financial.coverage')}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full accent-bg" 
                  style={{ width: `${Math.min(parseFloat(coverage), 100)}%` }}
                ></div>
              </div>
              <span className="font-bold">{coverage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---

// Move the main logic to a separate component
const SolarPortalContent = () => {
  const [panelType, setPanelType] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('panelType') || 'mono'
    }
    return 'mono'
  })
  const [inverterType, setInverterType] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('inverterType') || 'string'
    }
    return 'string'
  })
  const [angle, setAngle] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('angle')
      return saved ? parseInt(saved) : 30
    }
    return 30
  })
  const [azimuth, setAzimuth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('azimuth')
      return saved ? parseInt(saved) : 180
    }
    return 180
  })
  const [degradation, setDegradation] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('degradation')
      return saved ? parseFloat(saved) : 0.5
    }
    return 0.5
  })
  const [weather, setWeather] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weather')
      return saved ? parseInt(saved) : 90
    }
    return 90
  })
  const [layoutWidth, setLayoutWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('layoutWidth')
      return saved ? parseFloat(saved) : 10
    }
    return 10
  })
  const [layoutHeight, setLayoutHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('layoutHeight')
      return saved ? parseFloat(saved) : 10
    }
    return 10
  })
  const [panelSize, setPanelSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('panelSize')
      return saved || 'medium'
    }
    return 'medium'
  })
  const [panels, setPanels] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('panels')
      if (saved) return JSON.parse(saved)
    }
    return [{ id: 1, x: 40, y: 40, rotation: 0 }, { id: 2, x: 120, y: 40, rotation: 0 }]
  })
  
  const [engineeringParams, setEngineeringParams] = useState(() => {
    const defaults = {
      tempCoeff: -0.35,
      soiling: 2.0,
      mismatch: 1.5,
      dcOhmic: 1.0,
      shading: 3.0,
      inverterEff: 97.5,
      systemVoltage: 840,
      operatingCurrent: 12.4,
      cellTemp: 42.5,
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('engineeringParams')
      if (saved) {
        try {
          return { ...defaults, ...JSON.parse(saved) }
        } catch (e) {
          return defaults
        }
      }
    }
    return defaults
  })

  const [financialParams, setFinancialParams] = useState(() => {
    const defaults = {
      unitPrice: 0.15,
      currency: '$',
      monthlyConsumption: 450,
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('financialParams')
      if (saved) {
        try {
          return { ...defaults, ...JSON.parse(saved) }
        } catch (e) {
          return defaults
        }
      }
    }
    return defaults
  })

  // Persistence
  useEffect(() => {
    localStorage.setItem('engineeringParams', JSON.stringify(engineeringParams))
  }, [engineeringParams])

  useEffect(() => {
    localStorage.setItem('panels', JSON.stringify(panels))
  }, [panels])

  useEffect(() => {
    localStorage.setItem('financialParams', JSON.stringify(financialParams))
  }, [financialParams])

  useEffect(() => {
    localStorage.setItem('layoutWidth', layoutWidth.toString())
  }, [layoutWidth])

  useEffect(() => {
    localStorage.setItem('layoutHeight', layoutHeight.toString())
  }, [layoutHeight])

  useEffect(() => {
    localStorage.setItem('panelSize', panelSize)
  }, [panelSize])

  useEffect(() => {
    localStorage.setItem('panelType', panelType)
  }, [panelType])

  useEffect(() => {
    localStorage.setItem('inverterType', inverterType)
  }, [inverterType])

  useEffect(() => {
    localStorage.setItem('angle', angle.toString())
  }, [angle])

  useEffect(() => {
    localStorage.setItem('azimuth', azimuth.toString())
  }, [azimuth])

  useEffect(() => {
    localStorage.setItem('degradation', degradation.toString())
  }, [degradation])

  useEffect(() => {
    localStorage.setItem('weather', weather.toString())
  }, [weather])

  const exportData = () => {
    const data = [
      ['Parameter', 'Value'],
      ['Panel Type', panelType],
      ['Inverter Type', inverterType],
      ['Tilt Angle', angle],
      ['Azimuth', azimuth],
      ['Degradation Rate', degradation],
      ['Weather Factor', weather],
      ['Panel Count', panels.length],
      ['Temp Coeff', engineeringParams.tempCoeff],
      ['Soiling Loss', engineeringParams.soiling],
      ['Mismatch Loss', engineeringParams.mismatch],
      ['DC Ohmic Loss', engineeringParams.dcOhmic],
      ['Shading Loss', engineeringParams.shading],
      ['Inverter Efficiency', engineeringParams.inverterEff],
      ['Unit Price', financialParams.unitPrice],
      ['Currency', financialParams.currency],
      ['Monthly Consumption', financialParams.monthlyConsumption],
      ['Layout Data', JSON.stringify(panels)]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ubden_solar_project_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Calculate daily output for financial panel
  const panelWatts = panelSize === 'small' ? 300 : panelSize === 'medium' ? 450 : 600
  const baseEfficiency = panelType === 'mono' ? 0.22 : 0.18
  const angleFactor = Math.cos((Math.abs((angle || 0) - 30) * Math.PI) / 180)
  const weatherFactor = (weather || 0) / 100
  const degradationFactor = 1 - ((degradation || 0) / 100)
  const systemLossFactor = 1 - (((engineeringParams.soiling || 0) + (engineeringParams.mismatch || 0) + (engineeringParams.dcOhmic || 0) + (engineeringParams.shading || 0) + (100 - (engineeringParams.inverterEff || 100))) / 100)
  
  const rawCapacity = (panels.length * panelWatts * baseEfficiency * angleFactor * weatherFactor * degradationFactor * systemLossFactor)
  const capacity = isNaN(rawCapacity) ? "0.0" : rawCapacity.toFixed(1)
  const dailyOutput = (parseFloat(capacity) || 0) * 5.5

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <Navbar />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config & Details */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
          <ConfigPanel 
            panelType={panelType} setPanelType={setPanelType}
            inverterType={inverterType} setInverterType={setInverterType}
            angle={angle} setAngle={setAngle}
            azimuth={azimuth} setAzimuth={setAzimuth}
            degradation={degradation} setDegradation={setDegradation}
            weather={weather} setWeather={setWeather}
            engineeringParams={engineeringParams} setEngineeringParams={setEngineeringParams}
          />
          <SunPathAnimation angle={angle} azimuth={azimuth} />
          <FinancialPanel 
            financialParams={financialParams} 
            setFinancialParams={setFinancialParams}
            dailyOutput={dailyOutput}
          />
        </div>

        {/* Center Column: Canvas & Stats */}
        <div className="lg:col-span-9 flex flex-col gap-6 order-1 lg:order-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight">Project Overview</h2>
              <p className="opacity-60 text-sm">Real-time solar engineering simulation for Ubden® Solar FX</p>
            </div>
            <div className="flex items-center gap-2 glass-card px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono uppercase font-bold">System Online</span>
            </div>
          </div>

          <StatsDisplay 
            panels={panels} 
            angle={angle} 
            panelType={panelType} 
            degradation={degradation}
            weather={weather}
            engineeringParams={engineeringParams}
            panelSize={panelSize}
          />
          
          <div className="grid grid-cols-1 gap-6">
            <SolarCanvas 
              panelType={panelType} 
              inverterType={inverterType} 
              panels={panels} 
              setPanels={setPanels} 
              exportData={exportData}
              layoutWidth={layoutWidth}
              setLayoutWidth={setLayoutWidth}
              layoutHeight={layoutHeight}
              setLayoutHeight={setLayoutHeight}
              panelSize={panelSize}
              setPanelSize={setPanelSize}
              angle={angle}
              azimuth={azimuth}
            />
          </div>

          {/* Engineering Details moved here as requested */}
          <EngineeringDetails 
            engineeringParams={engineeringParams} 
            setEngineeringParams={setEngineeringParams} 
          />

          <div className="p-4 glass-card bg-amber-500/5 border-amber-500/20 flex items-start gap-3">
            <Info className="text-amber-500 shrink-0" size={18} />
            <p className="text-xs opacity-80 italic">
              {useLanguage().t('disclaimer.text')}
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
        <p className="text-xs font-mono">© 2026 UBDEN® SOLAR FX. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6 text-xs font-mono">
          <a href="#" className="hover:accent-text">PRIVACY</a>
          <a href="#" className="hover:accent-text">TERMS</a>
          <a href="#" className="hover:accent-text">SUPPORT</a>
        </div>
      </footer>
    </main>
  )
}

// Export the dynamic version
const DynamicSolarPortal = dynamic(() => Promise.resolve(SolarPortalContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
})

export default function SolarPortal() {
  return <DynamicSolarPortal />
}



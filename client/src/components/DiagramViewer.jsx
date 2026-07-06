import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

export default function DiagramViewer({ mermaidCode }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!mermaidCode || !containerRef.current) return;

    setError(null);
    setRendered(false);

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            background: '#0F1629',
            primaryColor: '#1A2444',
            primaryBorderColor: '#7C3AED',
            primaryTextColor: '#F1F5F9',
            secondaryColor: '#0F1629',
            tertiaryColor: '#141D35',
            lineColor: '#06B6D4',
            textColor: '#94A3B8',
            fontSize: '14px',
          },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram. The diagram syntax may be invalid.');
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  const handleDownload = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'architecture-diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Architecture Diagram</h4>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="btn-secondary p-1.5" title="Zoom out">
            <ZoomOut size={13} />
          </button>
          <span className="text-xs text-slate-500 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="btn-secondary p-1.5" title="Zoom in">
            <ZoomIn size={13} />
          </button>
          <button onClick={() => setZoom(1)} className="btn-secondary p-1.5" title="Reset zoom">
            <RotateCcw size={13} />
          </button>
          {rendered && (
            <button onClick={handleDownload} className="btn-secondary p-1.5" title="Download SVG">
              <Download size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Diagram */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-4 overflow-auto mermaid-container min-h-[300px] flex items-center justify-center"
      >
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm">{error}</p>
            <pre className="text-[11px] text-slate-600 mt-4 text-left bg-navy-950 p-3 rounded-lg overflow-auto max-h-48">
              {mermaidCode}
            </pre>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
          />
        )}
      </motion.div>
    </div>
  );
}

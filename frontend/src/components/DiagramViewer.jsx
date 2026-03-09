import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

const DiagramViewer = ({ generatedMermaid }) => {
  const diagramRef = useRef(null);

  useEffect(() => {
    if (generatedMermaid && diagramRef.current) {
      diagramRef.current.removeAttribute('data-processed');
      diagramRef.current.innerHTML = generatedMermaid;
      mermaid.contentLoaded();
    }
  }, [generatedMermaid]);

  return (
    <div className="w-full flex justify-center py-8 overflow-x-auto min-h-[400px]">
      <div className="mermaid" ref={diagramRef}>
        {generatedMermaid}
      </div>
    </div>
  );
};

export default DiagramViewer;

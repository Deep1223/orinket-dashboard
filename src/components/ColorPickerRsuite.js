'use client';

import { useState, useEffect, useRef } from 'react';
import Config from '../config/config';

const ColorPickerRsuite = ({ value, onChange, disabled = false, required = false }) => {
  const [isOpen, setIsOpen]             = useState(false);
  const [hue, setHue]                   = useState(244);
  const [alpha, setAlpha]               = useState(1);
  const [R, setR]                       = useState(91);
  const [G, setG]                       = useState(74);
  const [B, setB]                       = useState(232);
  const [dotX, setDotX]                 = useState(0.68);
  const [dotY, setDotY]                 = useState(0.4);
  const [activeSwatch, setActiveSwatch] = useState(null);

  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  const swatchColors = Config.colorPicker.swatchColors;

  useEffect(() => {
    const colorValue = value || Config.colorPicker.defaultColor;
    if (!colorValue) return;
    const color = parseColor(colorValue);
    if (color) {
      setR(color.r); setG(color.g); setB(color.b); setAlpha(color.a);
      setHue(Math.round(rgbToHsl(color.r, color.g, color.b).h));
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const wrap   = canvas.parentElement;
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
    drawGradient(canvas.getContext('2d'), canvas, hue);
  }, [isOpen, hue]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [isOpen]);

  const drawGradient = (ctx, canvas, hueVal) => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const gH = ctx.createLinearGradient(0, 0, w, 0);
    gH.addColorStop(0, '#fff');
    gH.addColorStop(1, `hsl(${hueVal},100%,50%)`);
    ctx.fillStyle = gH; ctx.fillRect(0, 0, w, h);
    const gV = ctx.createLinearGradient(0, 0, 0, h);
    gV.addColorStop(0, 'rgba(0,0,0,0)');
    gV.addColorStop(1, '#000');
    ctx.fillStyle = gV; ctx.fillRect(0, 0, w, h);
  };

  const parseColor = (color) => {
    if (!color || typeof color !== 'string') return null;
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 6) return { r: parseInt(hex.substr(0,2),16), g: parseInt(hex.substr(2,2),16), b: parseInt(hex.substr(4,2),16), a: 1 };
    } else if (color.startsWith('rgba(')) {
      const v = color.match(/[\d.]+/g);
      if (v?.length >= 4) return { r:+v[0], g:+v[1], b:+v[2], a:+v[3] };
    } else if (color.startsWith('rgb(')) {
      const v = color.match(/\d+/g);
      if (v?.length >= 3) return { r:+v[0], g:+v[1], b:+v[2], a:1 };
    }
    return null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h = ((g-b)/d+(g<b?6:0))/6; break;
        case g: h = ((b-r)/d+2)/6; break;
        case b: h = ((r-g)/d+4)/6; break;
        default: h = 0;
      }
    }
    return { h: h*360, s, l };
  };

  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2,'0');
  const getDisplayColor = () => {
    const a = parseFloat(alpha.toFixed(2));
    return a < 1 ? `rgba(${R},${G},${B},${a})` : `#${toHex(R)}${toHex(G)}${toHex(B)}`.toUpperCase();
  };
  const shouldUseWhiteText = () => (R*299+G*587+B*114)/1000 < 128;

  const pickCanvasColor = (px, py) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const x = Math.min(canvas.width-1,  Math.max(0, Math.round(px*canvas.width)));
    const y = Math.min(canvas.height-1, Math.max(0, Math.round(py*canvas.height)));
    const d = canvas.getContext('2d').getImageData(x,y,1,1).data;
    setR(d[0]); setG(d[1]); setB(d[2]);
  };

  const handleCanvasPointer = (e) => {
    if (e.type==='mousemove' && e.buttons!==1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    const y = Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));
    setDotX(x); setDotY(y); pickCanvasColor(x,y);
  };

  const handleHueSlider = (e) => {
    if (e.type==='mousemove' && e.buttons!==1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    const newHue = Math.round(pct*360);
    setHue(newHue);
    if (canvasRef.current) drawGradient(canvasRef.current.getContext('2d'),canvasRef.current,newHue);
    pickCanvasColor(dotX,dotY);
  };

  const handleAlphaSlider = (e) => {
    if (e.type==='mousemove' && e.buttons!==1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAlpha(Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)));
  };

  const handleRgbChange = (ch, val) => {
    const n = Math.max(0,Math.min(255,parseInt(val)||0));
    if (ch==='r') setR(n); else if (ch==='g') setG(n); else setB(n);
  };

  const handleHexChange = (val) => {
    const v = val.replace(/[^0-9a-fA-F]/g,'');
    if (v.length===6) { setR(parseInt(v.substr(0,2),16)); setG(parseInt(v.substr(2,2),16)); setB(parseInt(v.substr(4,2),16)); }
  };

  const handleSwatchClick = (color, index) => {
    setActiveSwatch(index);
    const hex = color.replace('#','');
    if (hex.length===6) { setR(parseInt(hex.substr(0,2),16)); setG(parseInt(hex.substr(2,2),16)); setB(parseInt(hex.substr(4,2),16)); setAlpha(1); }
  };

  const applyColor = () => { onChange?.(getDisplayColor()); setIsOpen(false); };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>

      {/* Trigger */}
      <div
        className={`color-field-row ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(v => !v)}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <div className="color-field-swatch" style={{ background: getDisplayColor() }} />
        <input className="color-field-hex" type="text" value={getDisplayColor()} readOnly disabled={disabled} />
        <svg className="color-field-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 3.5l3 3-9 9-4 1 1-4 9-9z"/><path d="M11 6l3 3"/>
        </svg>
      </div>

      {/* Panel — ALWAYS below, never flips up */}
      {isOpen && (
        <div
          className="color-picker-infobox"
          style={{ position:'absolute', top:'calc(100% + 4px)', left:0, width:320, zIndex:9999 }}
        >
          <div className="color-picker-content">

            <div className="color-canvas-wrap" onMouseDown={handleCanvasPointer} onMouseMove={handleCanvasPointer}>
              <canvas ref={canvasRef} />
              <div className="color-dot" style={{ left:`${dotX*100}%`, top:`${dotY*100}%`, background:`rgb(${R},${G},${B})` }} />
            </div>

            <div className="color-controls">
              <div className="color-row">
                <div className="color-preview" style={{ background:`rgb(${R},${G},${B})` }} />
                <div className="color-hex-wrap">
                  <span className="color-hash">#</span>
                  <input type="text" value={`${toHex(R)}${toHex(G)}${toHex(B)}`.toUpperCase()} onChange={e=>handleHexChange(e.target.value)} maxLength={6} />
                </div>
              </div>

              <div className="color-bar-wrap">
                <div className="color-bar-lbl"><span>Hue</span><span>{hue}°</span></div>
                <div className="color-bar-track" style={{ background:'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }} onMouseDown={handleHueSlider} onMouseMove={handleHueSlider}>
                  <div className="color-thumb" style={{ left:`${(hue/360)*100}%` }} />
                </div>
              </div>

              <div className="color-bar-wrap">
                <div className="color-bar-lbl"><span>Opacity</span><span>{Math.round(alpha*100)}%</span></div>
                <div className="color-alpha-outer">
                  <div className="color-alpha-checker" />
                  <div className="color-bar-track" style={{ background:`linear-gradient(to right,transparent,rgb(${R},${G},${B}))` }} onMouseDown={handleAlphaSlider} onMouseMove={handleAlphaSlider}>
                    <div className="color-thumb" style={{ left:`${alpha*100}%` }} />
                  </div>
                </div>
              </div>

              <div className="color-rgb-mini">
                {[['r',R],['g',G],['b',B]].map(([ch,val])=>(
                  <div className="color-rgb-mini-item" key={ch}>
                    <label>{ch.toUpperCase()}</label>
                    <input type="number" min={0} max={255} value={val} onChange={e=>handleRgbChange(ch,e.target.value)} />
                  </div>
                ))}
                <div className="color-rgb-mini-item">
                  <label>A</label>
                  <input type="number" min={0} max={100} value={Math.round(alpha*100)} onChange={e=>setAlpha(Math.max(0,Math.min(100,parseInt(e.target.value)||0))/100)} />
                </div>
              </div>
            </div>

            <div className="color-swatches">
              {swatchColors.map((color,index)=>(
                <div key={index} className={`color-swatch ${activeSwatch===index?'active':''}`} style={{ background:color }} onClick={()=>handleSwatchClick(color,index)} />
              ))}
            </div>

            <button className="color-apply" onClick={applyColor} style={{ background:getDisplayColor(), color:shouldUseWhiteText()?'#fff':'#333' }}>
              Apply Color
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerRsuite;
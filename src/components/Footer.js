import Config from '../config/config';

const Footer = () => {
  const C = Config.THEME;
  return (
    <footer
      className="text-center py-3 small w-100 border-top"
      style={{
        background: `linear-gradient(135deg, ${C.background} 0%, ${C.border} 100%)`,
        color: C.textMuted,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      © Copyright{' '}
      <span className="fw-bold" style={{ color: C.text }}>
        {Config.projectName}
      </span>
      . {Config.copyrightText}
    </footer>
  );
};

export default Footer;


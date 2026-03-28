/**
 * ServerGuard - Now just passes children through
 * Platform validation removed as platform feature is no longer needed
 */
const ServerGuard = ({ children }) => {
  return children;
};

export default ServerGuard;

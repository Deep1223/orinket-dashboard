import {
  FaRegEdit,
  FaInfoCircle,
  FaUser,
  FaHome,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { IoEyeOutline } from 'react-icons/io5';
import { FiAlertTriangle, FiEye, FiSidebar } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { TbGridDots } from 'react-icons/tb';
import { BiFilterAlt, BiSearch } from 'react-icons/bi';
import { IoIosClose } from 'react-icons/io';
import { GiArchiveResearch } from 'react-icons/gi';
import {
  MdEdit,
  MdDelete,
  MdVisibility,
  MdInfoOutline,
  MdFilterList,
  MdSearch,
} from 'react-icons/md';

// Central icon registry for the whole project.
// Usage:
//  <ActionIcon name="edit" />
//  <ActionIcon name="delete" />
//  <ActionIcon name="md-edit" variant="material" />
//  <ActionIcon name="fi-rr-home" variant="flaticon" />

const ICON_MAP = {
  // actions
  edit: FaRegEdit,
  delete: RiDeleteBin6Line,
  view: IoEyeOutline,
  info: FaInfoCircle,
  warning: FiAlertTriangle,
  menu: BsThreeDotsVertical,
  grid: TbGridDots,
  filter: BiFilterAlt,
  search: BiSearch,
  close: IoIosClose,

  // layout / nav
  home: FaHome,
  user: FaUser,
  settings: FaCog,
  help: FaQuestionCircle,
  logout: FaSignOutAlt,
  sidebarToggle: FiSidebar,
  research: GiArchiveResearch,

  // misc
  eye: FiEye,
};

// Material Design icon shortcuts (react-icons/md)
const MATERIAL_ICON_MAP = {
  'md-edit': MdEdit,
  'md-delete': MdDelete,
  'md-view': MdVisibility,
  'md-info': MdInfoOutline,
  'md-filter': MdFilterList,
  'md-search': MdSearch,
};

const ActionIcon = ({
  name,
  variant = 'auto', // 'auto' | 'material' | 'flaticon'
  size = 18,
  color,
  className = '',
  ...rest
}) => {
  // Flaticon / uicons support (requires flaticon CSS link in index.html)
  if (variant === 'flaticon') {
    // name should be like "fi-rr-home" etc.
    return <i className={`fi ${name} ${className}`} {...rest} />;
  }

  // Explicit material variant
  if (variant === 'material') {
    const MatIcon = MATERIAL_ICON_MAP[name] || MATERIAL_ICON_MAP[`md-${name}`];
    if (!MatIcon) return null;
    return <MatIcon size={size} color={color} className={className} {...rest} />;
  }

  // Auto: prefer project map, then material fallback, then flaticon class
  const Icon = ICON_MAP[name];
  if (Icon) {
    return <Icon size={size} color={color} className={className} {...rest} />;
  }

  const MatIcon = MATERIAL_ICON_MAP[name] || MATERIAL_ICON_MAP[`md-${name}`];
  if (MatIcon) {
    return <MatIcon size={size} color={color} className={className} {...rest} />;
  }

  // Fallback: assume flaticon class if name starts with "fi-"
  if (name && name.startsWith('fi-')) {
    return <i className={`fi ${name} ${className}`} {...rest} />;
  }

  return null;
};

export default ActionIcon;


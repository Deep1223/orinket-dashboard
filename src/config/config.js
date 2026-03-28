import IISMethods from '../utils/IISMethods';

// Config cloned from stock-dashboard, but apiBaseUrl/serverurl now
// come from IISMethods, so changing IISMethods.API_BASE_URL and
// IISMethods.STORAGE_MODE controls the whole common-project.

const Config = {
  // ==================== APP CONFIG ====================
  projectName: 'DEMO',
  emailCookieKey: 'user_email',
  copyrightText: 'All Rights Reserved',
  autoLogoutTime: 60 * 60 * 1000, // 1 hour
  apiTimeout: 30000, // 30 seconds
  defaultPageSize: 20,
  ScrollLimit: 100,
  sliderInterval: 5000,
  otpResendTimer: 60,
  defaultBannerImage: '/stock-2.jpg',

  // ==================== API CONFIG ====================
  localApiUrl: process.env.REACT_APP_LOCAL_API_URL || 'http://localhost:5000/api',

  // ==================== AUTH UI CONFIG ====================
  loginTitle: 'Sign in to your account',
  loginSubtitle: 'Welcome back! Please enter your login details below.',
  signupTitle: 'Create your account',
  signupSubtitle: 'Enter your details below to create an account.',
  forgotPasswordTitle: 'Reset your password',
  forgotPasswordSubtitle: 'Enter your email address to receive an OTP.',
  otpSentSubtitle: 'Enter the OTP sent to your email and your new password.',

  // ==================== SLIDER FEATURES ====================
  landingFeatures: [
    { title: 'Welcome to DEMO', desc: 'Your comprehensive dashboard for management and analytics.' },
    { title: 'Streamlined Workflow', desc: 'Optimize your daily tasks with our intuitive interface.' },
    { title: 'Data Driven Insights', desc: 'Make informed decisions based on accurate data analytics.' }
  ],
  loginFeatures: [
    { title: 'Secure Login', desc: 'Access your professional dashboard with enhanced security features.' },
    { title: 'Real-time Analytics', desc: 'Monitor your business performance with live data and insights.' },
    { title: 'Team Collaboration', desc: 'Work together seamlessly with your team members in one place.' }
  ],

  // ==================== COMMON UI STRINGS ====================
  headerSearchPlaceholder: 'Looking For Something? Just Type...',
  allMastersTitle: 'All Masters',
  noResultsFound: 'No results for',
  guestUser: 'Guest',
  noDataFound: 'No Data Found',
  
  // Page Not Found Config
  pageNotFoundTitle: 'Page Not Found',
  pageNotFoundOops: 'Oops! We lost this page',
  pageNotFoundDesc: "The page you're looking for doesn't exist, was removed, or the link might be broken.",
  
  // Access Denied Config
  accessDeniedTitle: 'Access Denied',
  accessDeniedHeading: "You don't have permission",
  accessDeniedDesc: 'You are not authorized to view this page. Please contact your administrator to request access.',
  
  goBackBtn: 'Go Back',
  backToHomeBtn: 'Back to Home',
  goToDashboardBtn: 'Go to Dashboard',
  requestedUrlLabel: 'Requested URL:',

  // ==================== SYSTEM DEFAULTS ====================
  systemAdminRoleId: process.env.REACT_APP_SYSTEM_ADMIN_ROLE_ID || '69ac79c8afeebd98e398c0ff',
  defaultUserId: process.env.REACT_APP_DEFAULT_USER_ID || '69ac78170e3c74bc59b89a4a',
  defaultUserEmail: process.env.REACT_APP_DEFAULT_USER_EMAIL || 'admin@gmail.com',
  adminPassword: process.env.REACT_APP_ADMIN_PASSWORD || 'Admin@123',

  // ==================== TOAST CONFIG ====================
  toastSuccessDuration: 3000,
  toastErrorDuration: 5000,

  // ==================== AUTH CONFIG ====================
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',

  // ==================== THEME SETTINGS ====================
  THEME: {
    primary: '#4361ee',
    primaryDark: '#2f4acb',
    primaryLight: '#eef0fd',
    primaryMedium: '#c5cdfa',
    background: '#f3f4f6',
    white: '#ffffff',
    border: '#e4e8f5',
    text: '#0f1528',
    textMuted: '#7c85a2',
    error: '#e53e3e',
    errorLight: '#fed7d7',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // ==================== BUTTON TEXTS ====================
  // Modal Buttons
  createbtn: 'Create',
  closebtn: 'Close',
  updatebtn: 'Update',
  cancelbtn: 'Cancel',
  continuebtn: 'Continue',
  deletebtn: 'Delete',
  previousbtn: 'Previous',
  nextbtn: 'Next',
  savebtn: 'Save',
  submitbtn: 'Submit',
  resetbtn: 'Reset',
  editbtn: 'Edit',
  viewbtn: 'View',
  searchbtn: 'Search',
  filterbtn: 'Filter',
  exportbtn: 'Export',
  importbtn: 'Import',
  downloadbtn: 'Download',
  uploadbtn: 'Upload',
  backbtn: 'Back',
  homebtn: 'Home',
  loginbtn: 'Login',
  logoutbtn: 'Logout',
  signupbtn: 'Sign Up',
  forgotpasswordbtn: 'Forgot Password',
  resetpasswordbtn: 'Reset Password',
  changepasswordbtn: 'Change Password',
  profilebtn: 'Profile',
  settingsbtn: 'Settings',
  helpbtn: 'Help',
  supportbtn: 'Support',
  contactbtn: 'Contact',

  // ==================== FORM LABELS ====================
  // User Form Labels
  fullnamelabel: 'Full Name',
  firstnamelabel: 'First Name',
  lastnamelabel: 'Last Name',
  emaillabel: 'Email Address',
  passwordlabel: 'Password',
  confirmpasswordlabel: 'Confirm Password',
  phonelabel: 'Phone Number',
  mobilelabel: 'Mobile Number',
  addresslabel: 'Address',
  citylabel: 'City',
  statelabel: 'State',
  countrylabel: 'Country',
  pincodelabel: 'PIN Code',
  rolelabel: 'User Role',
  departmentlabel: 'Department',
  designationlabel: 'Designation',
  companylabel: 'Company',
  websiteurl: 'Website URL',
  birthdatelabel: 'Birth Date',
  genderlabel: 'Gender',
  statuslabel: 'Status',
  activelabel: 'Active',
  inactivelabel: 'Inactive',

  // Lead Form Labels
  leadnamelabel: 'Lead Name',
  leademaillabel: 'Lead Email',
  leadphonelabel: 'Lead Phone',
  leadstatuslabel: 'Lead Status',
  leadsourcelabel: 'Lead Source',
  leadownerlabel: 'Lead Owner',
  leadvaluelabel: 'Lead Value',
  leadnotelabel: 'Notes',
  leadfilelabel: 'Lead File',
  leaddatelabel: 'Lead Date',
  followupdatelabel: 'Follow-up Date',

  // ==================== MESSAGES ====================
  MESSAGES: {
    // General Error Messages
    fillAllFields: 'Please Fill All Required Fields',
    required: 'is required',
    fieldRequired: 'This field is required',
    invalidFormat: 'Invalid format',
    invalidLength: 'Invalid length',
    invalidValue: 'Invalid value',
    networkError: 'Network error. Please check your connection',
    serverError: 'Server error. Please try again later',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    notFound: 'Resource not found',
    timeout: 'Request timeout. Please try again',
    unknownError: 'An unknown error occurred',

    // Validation Error Messages
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    invalidPassword: 'Invalid password format',
    weakPassword: 'Password must be at least 8 characters long, include 1 uppercase, 1 number, and 1 special character',
    passwordMismatch: 'Passwords do not match',
    onlyNumbers: 'should contain only digits',
    onlyAlphabets: 'should contain only alphabets',
    minLength: 'must be at least {min} characters',
    maxLength: 'must not exceed {max} characters',
    minValue: 'must be at least {min}',
    maxValue: 'must not exceed {max}',
    uniqueValue: 'This value already exists',
    invalidDate: 'Invalid date format',
    futureDate: 'Date cannot be in the future',
    pastDate: 'Date cannot be in the past',

    // File Upload Messages
    fileUploadSuccess: 'File uploaded successfully!',
    fileUploadFailed: 'File upload failed',
    errorUploadingFile: 'Error uploading file. Please try again.',
    invalidFileFormat: 'Invalid file format (Only CSV & XLSX allowed)',
    fileSizeExceeded: 'File size exceeds the maximum limit',
    fileNotFound: 'File not found',
    fileReadError: 'Error reading file',
    fileProcessError: 'Error processing file',

    // Authentication Messages
    loginFailed: 'Login failed. Please check your credentials',
    invalidCredentials: 'Invalid email or password',
    signupFailed: 'Sign up failed. Please try again.',
    accountCreatedSuccess: 'Account created successfully',
    accountLocked: 'Account is locked. Please contact administrator',
    sessionExpired: 'Session expired. Please login again',
    tokenExpired: 'Token expired. Please login again',
    userNotFound: 'User not found',
    userAlreadyExists: 'User already exists',
    passwordResetFailed: 'Password reset failed',
    emailNotVerified: 'Email not verified',
    otpSentSuccess: 'OTP sent successfully',
    otpResentSuccess: 'OTP resent successfully',
    otpSendFailed: 'Failed to send OTP',
    otpResendFailed: 'Failed to resend OTP',
    passwordResetSuccess: 'Password reset successfully',
    googleLoginFailed: 'Google login failed',

    // CRUD Messages
    dataSaved: 'Data saved successfully',
    dataUpdated: 'Data updated successfully',
    dataDeleted: 'Data deleted successfully',
    dataCreated: 'Data created successfully',
    dataFetched: 'Data fetched successfully',
    itemNotFound: 'Item not found',
    operationCompleted: 'Operation completed successfully',
  },

  // ==================== PLACEHOLDER TEXTS ====================
  // Form Placeholders
  enterfullname: 'Enter full name',
  enterfirstname: 'Enter first name',
  enterlastname: 'Enter last name',
  enteremail: 'Enter email address',
  enterpassword: 'Enter password',
  enterconfirmpassword: 'Confirm password',
  enterphone: 'Enter phone number',
  entermobile: 'Enter mobile number',
  enteraddress: 'Enter address',
  entercity: 'Enter city',
  enterstate: 'Enter state',
  entercountry: 'Enter country',
  enterpincode: 'Enter PIN code',
  selectrole: 'Select user role',
  selectdepartment: 'Select department',
  selectdesignation: 'Select designation',
  entercompany: 'Enter company name',
  enterwebsite: 'Enter website URL',
  selectbirthdate: 'Select birth date',
  selectgender: 'Select gender',
  selectstatus: 'Select status',

  // Search and Filter Placeholders
  searchplaceholder: 'Search...',
  filterplaceholder: 'Filter...',
  selectall: 'Select All',
  deselectall: 'Deselect All',
  selectoption: 'Select an option',
  selectmultiple: 'Select multiple options',
  enterkeyword: 'Enter keyword',
  enterdate: 'Enter date',
  enterdaterange: 'Enter date range',

  // ==================== TABLE HEADERS ====================
  // User Table Headers
  useridheader: 'User ID',
  usernameheader: 'User Name',
  useremailheader: 'Email',
  userphoneheader: 'Phone',
  userroleheader: 'Role',
  userstatusheader: 'Status',
  usercreateddateheader: 'Created Date',
  userlastloginheader: 'Last Login',
  useractionsheader: 'Actions',

  // Lead Table Headers
  leadidheader: 'Lead ID',
  leadnameheader: 'Lead Name',
  leademailheader: 'Email',
  leadphoneheader: 'Phone',
  leadstatusheader: 'Status',
  leadsourceheader: 'Source',
  leadownerheader: 'Owner',
  leadvalueheader: 'Value',
  leaddateheader: 'Date',
  leadactionsheader: 'Actions',

  // ==================== PAGE TITLES ====================
  // Page Titles
  dashboardtitle: 'Dashboard',
  userstitle: 'Users',
  createusertitle: 'Create User',
  editusertitle: 'Edit User',
  viewusertitle: 'View User',
  leadstitle: 'Leads',
  createleadtitle: 'Create Lead',
  editleadtitle: 'Edit Lead',
  viewleadtitle: 'View Lead',
  salestitle: 'Sales',
  reportstitle: 'Reports',
  settingstitle: 'Settings',
  profiletitle: 'Profile',
  loginpage: 'Login',
  signuppage: 'Sign Up',
  forgotpasswordpage: 'Forgot Password',
  resetpasswordpage: 'Reset Password',
  changepasswordpage: 'Change Password',

  // ==================== NAVIGATION TEXTS ====================
  // Navigation Menu
  home: 'Home',
  dashboard: 'Dashboard',
  users: 'Users',
  leads: 'Leads',
  sales: 'Sales',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  logout: 'Logout',
  help: 'Help',
  support: 'Support',
  contact: 'Contact',
  about: 'About',

  // ==================== NOTIFICATION TEXTS ====================
  notificationsTitle: 'Notification(s)',
  newNotifications: 'new',
  allFilter: 'All',
  unreadFilter: 'Unread',
  noUnreadNotifications: 'No unread notifications',
  noNotifications: 'No notifications',
  markAllAsRead: 'Mark all as read',
  showAll: 'Show All →',

  // ==================== STATUS TEXTS ====================
  // Status Options
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',

  // Lead Status Options
  newlead: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closedwon: 'Closed Won',
  closedlost: 'Closed Lost',

  // ==================== ROLE TEXTS ====================
  // User Roles
  administrator: 'Administrator',
  admin: 'Admin',
  salesuser: 'Sales User',
  salesperson: 'Salesperson',
  manager: 'Manager',
  supervisor: 'Supervisor',
  employee: 'Employee',
  guest: 'Guest',

  // ==================== GENDER OPTIONS ====================
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefernottosay: 'Prefer not to say',

  // ==================== FILE TYPES ====================
  csv: 'CSV',
  xlsx: 'XLSX',
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  txt: 'TXT',

  // ==================== DATE FORMATS ====================
  dateLocale: 'en-IN',
  dateOptions: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  timeOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  },
  dateformat1: 'DD/MM/YYYY',
  dateformat2: 'MM/DD/YYYY',
  dateformat3: 'YYYY-MM-DD',
  datetimeformat1: 'DD/MM/YYYY HH:mm',
  datetimeformat2: 'MM/DD/YYYY HH:mm',
  datetimeformat3: 'YYYY-MM-DD HH:mm:ss',

  // ==================== CURRENCY ====================
  inr: 'INR',
  usd: 'USD',
  eur: 'EUR',
  gbp: 'GBP',
  currencySymbol: '₹',
  currencyCode: 'INR',

  // ==================== API ENDPOINTS ====================
  // NOTE: For common-project, we always take base URL from IISMethods.
  // Getters avoid circular dependency (config -> IISMethods -> config).
  get apiBaseUrl() {
    return IISMethods.getBaseUrl();
  },
  get serverurl() {
    return IISMethods.getBaseUrl();
  },
  useraction: '/api',
  authEndpoint: '/auth',
  usersEndpoint: '/users',
  leadsEndpoint: '/leads',
  salesEndpoint: '/sales',
  reportsEndpoint: '/reports',
  uploadEndpoint: '/upload',
  downloadEndpoint: '/download',

  // ==================== APP CONFIGURATION ====================
  appName: 'CRM System',
  appVersion: '1.0.0',
  appDescription: 'Customer Relationship Management System',
  companyName: 'Your Company Name',
  companyAddress: 'Your Company Address',
  companyPhone: '+91 1234567890',
  companyEmail: 'info@yourcompany.com',
  companyWebsite: 'https://yourcompany.com',

  // ==================== PAGINATION ====================
  itemsPerPage: 10,
  itemsPerPageOptions: [5, 10, 25, 50, 100],
  showPagination: true,
  showPageSizeSelector: true,
  showTotalItems: true,

  // ==================== TOAST SETTINGS ====================
  toastPosition: 'top-right',
  toastAutoClose: 3000,
  toastHideProgressBar: false,
  toastCloseOnClick: true,
  toastPauseOnHover: true,
  toastDraggable: true,
  toastLimit: 5,

  // ==================== <MASTER DATA> ====================
  // Color Picker Configuration
  colorPicker: {
    swatchColors: [
      '#FF3A3A', '#FF7A3A', '#FFCE3A', '#3AFF6A', '#3AFFDA', '#3A8AFF',
      '#9B3AFF', '#FF3ACA', '#c8f542', '#fff', '#888', '#333',
      '#1D9E75', '#E24B4A', '#378ADD', '#5B4AE8'
    ],
    defaultColor: '#5B4AE8'
  },

  // Language Options
  languageOptions: [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
  ],

  // Status options (Active/Inactive)
  statusOptions: [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ],

  // Gender options for User Master
  genderOptions: [
    { label: 'Male', value: '65f1a2b3c4d5e6f7890a1b2c' },
    { label: 'Female', value: '65f1a2b3c4d5e6f7890a1b2d' },
    { label: 'Other', value: '65f1a2b3c4d5e6f7890a1b2e' },
  ],

  // Role options for User Master
  roleOptions: [
    { label: 'Administrator', value: '69ac79c8afeebd98e398c0ff' },
    { label: 'Admin', value: '69ac79d99c8aa64af9bca255' },
    { label: 'Manager', value: '69ac79e17fa1ffa9b6b17038' },
    { label: 'User', value: '69ac79e9d5fbb8517fc5238e' },
    { label: 'Guest', value: '69ac79f1dd5502e9edd95d28' },
  ],
  // Placeholder for location adropdowns (can be replaced with API/masterdata later)
  countryOptions: [],
  stateOptions: [],
  cityOptions: [],
  // ===================== </MASTER DATA> ====================
};

export default Config;

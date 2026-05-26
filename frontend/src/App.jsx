import React, { useState, useEffect } from 'react';
import { 
  Megaphone, ShieldAlert, Award, LogIn, UserPlus, LogOut, PlusCircle, 
  MapPin, Clock, CheckCircle2, ChevronRight, BarChart3, Star, AlertTriangle, 
  User, Briefcase, RefreshCw, Send, X, ArrowUpRight, Flame, Menu, Camera, Upload, Trash2, KeyRound, Check, ShieldCheck,
  Sun, Moon, Phone, Mail, Building, Compass
} from 'lucide-react';
import { api } from './utils/api';
import { auth, googleProvider } from './utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import LandingView from './components/LandingView';
import ExploreView from './components/ExploreView';
import AboutView from './components/AboutView';
import CitizenDashboard from './components/CitizenDashboard';
import MyComplaintsView from './components/MyComplaintsView';
import RankingsView from './components/RankingsView';
import OfficialWorkspace from './components/OfficialWorkspace';
import OfficialAnalytics from './components/OfficialAnalytics';
import AdminDashboard from './components/AdminDashboard';
import AdminAnalytics from './components/AdminAnalytics';
import { getTranslator } from './utils/translations';


function LogoSVG({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} shrink-0`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Orbit Rings */}
      <circle cx="48" cy="46" r="38" stroke="url(#orbitGradient)" strokeWidth="1.5" strokeDasharray="160 50" />
      <circle cx="48" cy="46" r="42" stroke="url(#orbitGradientTeal)" strokeWidth="1" strokeDasharray="80 180" />
      
      {/* Orbit Dots */}
      <circle cx="83" cy="27" r="3.5" fill="#10B981" />
      <circle cx="15" cy="62" r="3.5" fill="#3B82F6" />

      {/* Main Map Pin Shadow */}
      <ellipse cx="48" cy="88" rx="14" ry="2.5" fill="rgba(0,0,0,0.15)" />

      {/* Main Map Pin Outline */}
      <path 
        d="M48 16C31.4 16 18 29.4 18 46C18 64.6 44.2 84.8 45.8 86C47 87 49 87 50.2 86C51.8 84.8 78 64.6 78 46C78 29.4 64.6 16 48 16Z" 
        fill="url(#pinGradient)" 
      />

      {/* Skyline Silhouette inside the pin */}
      <path 
        d="M26 62h44V55h-4v-7h-5v-10h-6v5h-4v-9h-6v10h-4v4h-5v7h-5v7z" 
        fill="url(#cityGradient)" 
        opacity="0.35" 
      />
      <path 
        d="M32 62h32V57h-3v-5h-4v-8h-4v4h-3v-7h-4v7h-3v3h-4v3h-3v6z" 
        fill="url(#cityGradient)" 
        opacity="0.65" 
      />

      {/* Three People Silhouettes (Avatars) */}
      <circle cx="39" cy="51" r="4" fill="#10B981" />
      <path d="M32 62c0-3 2.5-5 6-5s6 2 6 5H32z" fill="#10B981" />

      <circle cx="57" cy="51" r="4" fill="#60A5FA" />
      <path d="M50 62c0-3 2.5-5 6-5s6 2 6 5H50z" fill="#60A5FA" />

      <circle cx="48" cy="48" r="5" fill="#1E3A8A" />
      <path d="M39 62c0-4 3.5-7 8-7s8 3 8 7H39z" fill="#1E3A8A" />

      {/* Corner Security Checkmark Shield */}
      <path 
        d="M62 64c0 0 0-4 6-6s8-1 8-1s2 10-6 16c-8-6-8-16-8-16z" 
        fill="#10B981" 
        stroke="white" 
        strokeWidth="1.5" 
      />
      <path 
        d="M67 72l2 2 4-4" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      <defs>
        <linearGradient id="pinGradient" x1="48" y1="16" x2="48" y2="87" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="cityGradient" x1="48" y1="36" x2="48" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="orbitGradient" x1="10" y1="46" x2="86" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="orbitGradientTeal" x1="48" y1="4" x2="48" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function App() {
  // Navigation Router & Responsive States
  const [view, setView] = useState('landing'); // 'landing' | 'explore' | 'about' | 'login' | 'register' | 'citizen-dash' | 'my-complaints' | 'leaderboard' | 'official-dash' | 'official-analytics' | 'admin-dash' | 'admin-analytics'
  const [authRole, setAuthRole] = useState('citizen'); // 'citizen' | 'official' | 'admin'
  const [registerRole, setRegisterRole] = useState('citizen'); // 'citizen' | 'official'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Custom CivicSync UI States
  const [exploreGridView, setExploreGridView] = useState(true);
  const [exploreMapView, setExploreMapView] = useState(false);
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreWardFilter, setExploreWardFilter] = useState('all');
  const [exploreDeptFilter, setExploreDeptFilter] = useState('all');
  const [exploreStatusFilter, setExploreStatusFilter] = useState('all');
  const [exploreSort, setExploreSort] = useState('newest'); // 'newest' | 'upvotes'
  const [officialTaskTab, setOfficialTaskTab] = useState('Pending'); // 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected'
  const [selectedDetailGrievance, setSelectedDetailGrievance] = useState(null);
  
  // Current logged in user info
  const [user, setUser] = useState(null);
  
  // Auth Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Official Specific Registration Fields
  const [offJurisdictionId, setOffJurisdictionId] = useState('');
  const [offDepartmentId, setOffDepartmentId] = useState('');
  const [offDesignation, setOffDesignation] = useState('');
  const [offOfficeAddress, setOffOfficeAddress] = useState('');
  const [offIdProof, setOffIdProof] = useState(''); // Base64 Office ID
  const [offPhotoProof, setOffPhotoProof] = useState(''); // Base64 Self Photo
  
  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState(''); // Simulated code shown for testing ease
  
  // App States
  const [popularGrievances, setPopularGrievances] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [officialStats, setOfficialStats] = useState({ pending_count: 0, active_count: 0, escalated_count: 0, total_count: 0 });
  const [pendingOfficials, setPendingOfficials] = useState([]); // Admin approvals list
  const [selectedTimeline, setSelectedTimeline] = useState(null); // stores grievance for timeline modal
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [selectedFeedbackGrievance, setSelectedFeedbackGrievance] = useState(null); // grievance being rated
  
  // Status Resolution States
  const [showResolveModal, setShowResolveModal] = useState(null); // stores grievance to resolve
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [departmentComplaints, setDepartmentComplaints] = useState([]);
  const [otherComplaints, setOtherComplaints] = useState([]);
  const [showUpdateDialogId, setShowUpdateDialogId] = useState(null);
  const [updateMessageText, setUpdateMessageText] = useState('');
  const [solutionImage, setSolutionImage] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');

  // Rating States
  const [ratingSpeed, setRatingSpeed] = useState(5);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingComm, setRatingComm] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // File Grievance Form States
  const [showFileModal, setShowFileModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [newWardId, setNewWardId] = useState(''); // Selected Ward ID for Complaint
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState('12.9304');
  const [newLng, setNewLng] = useState('77.6784');
  const [newImg, setNewImg] = useState('');
  
  // Custom Searchable Dropdown & Proximity States
  const [wardSearchQuery, setWardSearchQuery] = useState('');
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [offWardSearchQuery, setOffWardSearchQuery] = useState('');
  const [showOffWardDropdown, setShowOffWardDropdown] = useState(false);
  const [wardSuggestionMsg, setWardSuggestionMsg] = useState('');
  const [deptSuggestionMsg, setDeptSuggestionMsg] = useState('');

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-clear toast notifications after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Responsive Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Localization / Language State
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('civicsync_language');
    return saved !== null ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('civicsync_language', language);
  }, [language]);

  const t = getTranslator(language);

  // Tri-state Theme Configuration
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('civicsync_theme_mode');
    return saved !== null ? saved : 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('civicsync_theme_mode', themeMode);
    
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);
      
      const handler = (e) => {
        setIsDarkMode(e.matches);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  };

  // Hardcoded valid official domains list for fast frontend alerts
  const validOfficialDomains = ['gov.in', 'nic.in', 'karnataka.gov.in', 'bbmp.gov.in', 'bescom.org', 'bwssb.gov.in'];

  const WARD_COORDINATES = {
    5: { lat: 13.0784, lng: 77.6068, name: 'Jakkur' },
    6: { lat: 13.0549, lng: 77.6326, name: 'Thanisandra' },
    11: { lat: 13.0506, lng: 77.5597, name: 'Kuvempunagar' },
    24: { lat: 13.0189, lng: 77.6258, name: 'HBR Layout' },
    25: { lat: 13.0298, lng: 77.6598, name: 'Horamavu' },
    45: { lat: 12.9961, lng: 77.5713, name: 'Malleshwaram' },
    63: { lat: 13.0031, lng: 77.5969, name: 'Jayamahal' },
    70: { lat: 13.0135, lng: 77.5146, name: 'Rajagopalanagar' },
    71: { lat: 12.9926, lng: 77.5126, name: 'Hegganahalli' },
    104: { lat: 12.9774, lng: 77.5304, name: 'Govindarajanagar' },
    111: { lat: 12.9719, lng: 77.6011, name: 'Shanthalanagar' },
    112: { lat: 12.9610, lng: 77.6387, name: 'Domlur' },
    125: { lat: 12.9192, lng: 77.5925, name: 'Marenahalli' },
    126: { lat: 12.9625, lng: 77.5325, name: 'Maruthi Mandira' },
    149: { lat: 12.9406, lng: 77.7471, name: 'Varthur' },
    150: { lat: 12.9304, lng: 77.6784, name: 'Bellandur' },
    151: { lat: 12.9352, lng: 77.6244, name: 'Koramangala' },
    152: { lat: 12.9302, lng: 77.6094, name: 'Sudduguntepalya' },
    153: { lat: 12.9308, lng: 77.5838, name: 'Jayanagar' },
    154: { lat: 12.9406, lng: 77.5738, name: 'Basavanagudi' }
  };

  const getClosestWardId = (lat, lng) => {
    let closestId = null;
    let minDistance = Infinity;
    const targetLat = parseFloat(lat);
    const targetLng = parseFloat(lng);
    
    if (isNaN(targetLat) || isNaN(targetLng)) return null;

    for (const [id, coords] of Object.entries(WARD_COORDINATES)) {
      const dist = Math.sqrt(Math.pow(coords.lat - targetLat, 2) + Math.pow(coords.lng - targetLng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestId = parseInt(id);
      }
    }
    return closestId;
  };

  const suggestDepartmentByTitle = (title) => {
    const t = title.toLowerCase();
    if (t.includes('pothole') || t.includes('road') || t.includes('tar') || t.includes('crater') || t.includes('bridge') || t.includes('street') || t.includes('infra')) {
      return 1; // Road Department
    }
    if (t.includes('water') || t.includes('leak') || t.includes('sewage') || t.includes('pipe') || t.includes('drain') || t.includes('drinking') || t.includes('bwssb')) {
      return 2; // Water Department
    }
    if (t.includes('light') || t.includes('power') || t.includes('electricity') || t.includes('bescom') || t.includes('shock') || t.includes('wire') || t.includes('cable')) {
      return 3; // Electricity Department
    }
    if (t.includes('garbage') || t.includes('clean') || t.includes('sanitation') || t.includes('waste') || t.includes('trash') || t.includes('dump') || t.includes('piles')) {
      return 4; // Sanitation Department
    }
    return null;
  };

  const fetchPopular = async (coords) => {
    try {
      const lat = coords?.lat || null;
      const lng = coords?.lng || null;
      const list = await api.getPopularGrievances(lat, lng);
      setPopularGrievances(list);
    } catch (err) {
      console.error("Failed to fetch popular grievances:", err);
    }
  };

  const handleUpvote = async (grievanceId) => {
    if (!user) {
      setErrorMsg("Please sign in to upvote complaints!");
      setView('login');
      setAuthRole('citizen');
      return;
    }
    try {
      const res = await api.toggleUpvote(grievanceId);
      setSuccessMsg(res.message);
      fetchPopular(userLocation);
      if (user.role === 'citizen') {
        fetchCitizenGrievances();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  // Track location and fetch popular problems
  useEffect(() => {
    if (view === 'landing') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(coords);
            fetchPopular(coords);
          },
          (err) => {
            console.log("Location permission denied. Sorting by upvotes.");
            fetchPopular(null);
          }
        );
      } else {
        fetchPopular(null);
      }
    }
  }, [view, user]);

  const checkDuplicates = async (lat, lng, deptId) => {
    if (!lat || !lng || !deptId) {
      setDuplicateSuggestions([]);
      return;
    }
    try {
      const list = await api.checkDuplicateGrievances(lat, lng, deptId);
      setDuplicateSuggestions(list);
    } catch (err) {
      console.error("Duplicate check failed:", err);
    }
  };

  // Debounced duplicate detection watcher
  useEffect(() => {
    if (!showFileModal) {
      setDuplicateSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      checkDuplicates(newLat, newLng, newDeptId);
    }, 450); // 450ms debounce to avoid rapid calls during pin drags

    return () => clearTimeout(delayDebounce);
  }, [newLat, newLng, newDeptId, showFileModal]);

  // Proximity Ward suggestions effect
  useEffect(() => {
    if (showFileModal) {
      const suggestedId = getClosestWardId(newLat, newLng);
      if (suggestedId) {
        setNewWardId(suggestedId.toString());
        const wardInfo = WARD_COORDINATES[suggestedId];
        setWardSuggestionMsg(`Auto-detected: ${wardInfo.name} (#${suggestedId}) based on location pin!`);
        setWardSearchQuery(wardInfo.name);
      } else {
        setWardSuggestionMsg('');
      }
    } else {
      setWardSuggestionMsg('');
      setWardSearchQuery('');
    }
  }, [newLat, newLng, showFileModal]);

  // Title-to-department keyword suggestion effect
  useEffect(() => {
    if (showFileModal) {
      const suggestedDeptId = suggestDepartmentByTitle(newTitle);
      if (suggestedDeptId) {
        setNewDeptId(suggestedDeptId.toString());
        const deptNames = { 1: 'Road Department', 2: 'Water Department', 3: 'Electricity Department', 4: 'Sanitation Department' };
        setDeptSuggestionMsg(`Auto-selected: ${deptNames[suggestedDeptId]} based on title keywords!`);
      } else {
        setDeptSuggestionMsg('');
      }
    } else {
      setDeptSuggestionMsg('');
    }
  }, [newTitle, showFileModal]);

  // Load cached user session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('publicecho_user');
    const token = localStorage.getItem('publicecho_token');
    if (cachedUser && token) {
      const parsedUser = JSON.parse(cachedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'citizen') {
        setView('citizen-dash');
      } else if (parsedUser.role === 'admin') {
        setView('admin-dash');
      } else {
        setView('official-dash');
      }
    }
    fetchBaseData();
  }, []);

  // Sync data based on current active view
  useEffect(() => {
    if (user) {
      if (user.role === 'citizen' && (view === 'citizen-dash' || view === 'my-complaints' || view === 'explore')) {
        fetchCitizenGrievances();
      } else if (user.role === 'official' && (view === 'official-dash' || view === 'official-analytics')) {
        fetchOfficialGrievances();
      } else if (user.role === 'admin' && (view === 'admin-dash' || view === 'admin-analytics')) {
        fetchPendingOfficials();
      }
    }
    if (view === 'leaderboard' || view === 'landing' || view === 'explore') {
      fetchLeaderboard();
    }
  }, [view, user]);

  // Leaflet Map Initialization Hook (Triggers when File Complaint modal opens)
  useEffect(() => {
    if (showFileModal && window.L) {
      setTimeout(() => {
        const mapContainer = document.getElementById('map-picker');
        if (!mapContainer) return;

        if (window.myMap) {
          window.myMap.remove();
        }

        const initLat = parseFloat(newLat) || 12.9304;
        const initLng = parseFloat(newLng) || 77.6784;

        const map = window.L.map('map-picker').setView([initLat, initLng], 14);
        window.myMap = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        const marker = window.L.marker([initLat, initLng], { draggable: true }).addTo(map);
        window.myMarker = marker;

        marker.on('dragend', function (e) {
          const position = marker.getLatLng();
          setNewLat(position.lat.toFixed(6));
          setNewLng(position.lng.toFixed(6));
        });

        map.on('click', function (e) {
          const position = e.latlng;
          marker.setLatLng(position);
          setNewLat(position.lat.toFixed(6));
          setNewLng(position.lng.toFixed(6));
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 200);

      }, 300);
    }
  }, [showFileModal]);

  const fetchBaseData = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);

      const wardsList = await api.getWards();
      setJurisdictions(wardsList.map(w => ({ id: w.id, name: `${w.name} (${w.zone_name})`, tier: 'Ward' })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCitizenGrievances = async () => {
    setLoading(true);
    try {
      const list = await api.getCitizenGrievances();
      setGrievances(list);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficialGrievances = async () => {
    setLoading(true);
    try {
      const data = await api.getOfficialGrievances();
      setDepartmentComplaints(data.departmentComplaints || []);
      setOtherComplaints(data.otherComplaints || []);
      setOfficialStats(data.stats);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOfficials = async () => {
    setLoading(true);
    try {
      const pendings = await api.getPendingOfficials();
      setPendingOfficials(pendings);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const list = await api.getLeaderboard();
      setLeaderboard(list);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewTimeline = async (grievance) => {
    setSelectedTimeline(grievance);
    try {
      const logs = await api.getTimeline(grievance.id);
      setTimelineLogs(logs);
    } catch (err) {
      showError('Failed to retrieve status log history.');
    }
  };

  // Auth Operations
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setAuthLoading(true);

    try {
      if (view === 'register') {
        if (registerRole === 'citizen') {
          // Citizen signup
          const data = await api.registerCitizen(name, email, password, phone);
          setUser(data.user);
          setSuccessMsg('Citizen registration successful!');
          setView('citizen-dash');
        } else {
          // Upgraded Official Signup with Domain and Proof Checks
          const emailParts = email.split('@');
          const domain = emailParts.length > 1 ? emailParts[1] : '';
          if (!validOfficialDomains.includes(domain)) {
            showError(`Access Denied: Non-official domain '@${domain}' used! Authorized suffixes: ${validOfficialDomains.join(', ')}.`);
            setAuthLoading(false);
            return;
          }
          if (!offJurisdictionId || !offDesignation || !offOfficeAddress || !offIdProof || !offPhotoProof) {
            showError('All fields including ID Card, Portrait, and Office Address are mandatory.');
            setAuthLoading(false);
            return;
          }

          await api.registerOfficial(
            name,
            email,
            password,
            parseInt(offJurisdictionId),
            offDepartmentId ? parseInt(offDepartmentId) : null,
            offDesignation,
            offOfficeAddress,
            offIdProof,
            offPhotoProof
          );
          setSuccessMsg('Registration request logged! Awaiting administrator approval.');
          setView('login');
          setAuthRole('official');
        }
      } else {
        // Standard Logins
        if (authRole === 'citizen' || authRole === 'admin') {
          // Citizen/Admin Login (Megharaj uses this endpoint)
          const data = await api.loginCitizen(email, password);
          setUser(data.user);
          if (data.user.role === 'admin') {
            setView('admin-dash');
            setSuccessMsg('Admin Portal session initiated successfully!');
          } else {
            setView('citizen-dash');
            setSuccessMsg('Citizen Dashboard active.');
          }
        } else {
          // Upgraded Official Login (Requires government domain suffix & issues OTP)
          const emailParts = email.split('@');
          const domain = emailParts.length > 1 ? emailParts[1] : '';
          if (!validOfficialDomains.includes(domain)) {
            showError(`Access Denied: Non-official domain '@${domain}' used! Authorized suffixes: ${validOfficialDomains.join(', ')}.`);
            setAuthLoading(false);
            return;
          }

          const response = await api.loginOfficial(email, password);
          if (response.otpRequired) {
            setOtpEmail(response.email);
            setSimulatedOtp(response.simulatedCode);
            setShowOtpModal(true);
            setSuccessMsg('Verification code generated!');
          }
        }
      }
      
      // Clear forms
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setOffDesignation('');
      setOffJurisdictionId('');
      setOffDepartmentId('');
      setOffIdProof('');
      setOffPhotoProof('');
    } catch (err) {
      showError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // OTP Verification Submission
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setAuthLoading(true);

    try {
      const data = await api.verifyOTP(otpEmail, otpCode);
      setUser(data.user);
      setShowOtpModal(false);
      setOtpCode('');
      setOtpEmail('');
      setSimulatedOtp('');
      setSuccessMsg('Verification successful! Access granted.');
      setView('official-dash');
    } catch (err) {
      showError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Admin approval decisions
  const handleAdminApproval = async (officialId, action) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (action === 'approve') {
        await api.approveOfficial(officialId);
        setSuccessMsg('Official successfully verified and approved!');
      } else {
        await api.rejectOfficial(officialId);
        setSuccessMsg('Official registration rejected.');
      }
      fetchPendingOfficials();
    } catch (err) {
      showError(err.message);
    }
  };

  // Real Firebase Google Authentication & MySQL Sync (Both signup and signin)
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setAuthLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      if (googleUser && googleUser.email) {
        // Send authenticated details to Express backend for MySQL storage/JWT generation
        const data = await api.loginGoogle(googleUser.email, googleUser.displayName || 'Google User');
        setUser(data.user);
        setSuccessMsg(`Welcome, ${data.user.name}! Successfully authenticated with Google.`);
        
        if (data.user.role === 'citizen') {
          setView('citizen-dash');
        } else if (data.user.role === 'admin') {
          setView('admin-dash');
        } else if (data.user.role === 'official') {
          setView('official-dash');
        }
      }
    } catch (err) {
      console.error("Google Authentication Popup Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        showError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setView('landing');
    setSuccessMsg('Logged out successfully.');
    setMobileMenuOpen(false);
  };

  // Base64 Reader for Proofs
  const handleProofSelection = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showError("Please upload a smaller image file (limit 1MB to protect DB storage).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'id') {
        setOffIdProof(reader.result);
      } else {
        setOffPhotoProof(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Picture Upload Actions (Converts images to Base64 data URLs)
  const handlePictureSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showError("Please choose a smaller image (limit is 1MB to ensure stable DB execution).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // HTML5 Browser Geolocation GPS Finder
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setNewLat(lat);
        setNewLng(lng);
        setNewAddress(`Detected via device GPS: Latitude ${lat}, Longitude ${lng}`);
        
        if (window.myMarker && window.myMap) {
          window.myMarker.setLatLng([lat, lng]);
          window.myMap.setView([lat, lng], 14);
        }

        setSuccessMsg("Precise GPS Coordinates captured!");
      },
      (error) => {
        console.error(error);
        showError("Failed to fetch location. Please grant permission inside browser settings.");
      }
    );
  };

  // Dynamic Map presetter syncer
  const applyCoordinatePreset = (preset) => {
    let lat = '12.9304';
    let lng = '77.6784';
    let address = 'Bellandur Lake Gate Road, Bengaluru, Karnataka';

    if (preset === 'hsr') {
      lat = '12.9105';
      lng = '77.6450';
      address = '27th Main Road, Sector 1, HSR Layout, Bengaluru, Karnataka';
    }

    setNewLat(lat);
    setNewLng(lng);
    setNewAddress(address);

    if (window.myMarker && window.myMap) {
      window.myMarker.setLatLng([parseFloat(lat), parseFloat(lng)]);
      window.myMap.setView([parseFloat(lat), parseFloat(lng)], 14);
    }
  };

  // Grievance Actions
  const handleFileGrievance = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newTitle || !newDesc || !newDeptId || !newWardId || !newAddress) {
      showError('Please fill out all mandatory fields including administrative Ward selection.');
      return;
    }

    try {
      await api.createGrievance(
        newTitle,
        newDesc,
        parseInt(newDeptId),
        parseInt(newWardId),
        parseFloat(newLat),
        parseFloat(newLng),
        newAddress,
        newImg || null
      );
      setSuccessMsg('Complaint registered and auto-routed successfully!');
      setShowFileModal(false);
      
      setNewTitle('');
      setNewDesc('');
      setNewDeptId('');
      setNewWardId('');
      setNewAddress('');
      setNewImg('');
      setWardSuggestionMsg('');
      setDeptSuggestionMsg('');
      
      fetchCitizenGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.updateStatus(grievanceId, newStatus, resolutionNotes || `Investigation status: ${newStatus}`);
      setSuccessMsg(`Status successfully changed to ${newStatus}.`);
      setShowResolveModal(null);
      setResolutionNotes('');
      fetchOfficialGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleEscalate = async (grievanceId) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!confirm('Are you sure you want to escalate this complaint to the next superior authority?')) return;
    
    try {
      await api.escalateGrievance(grievanceId);
      setSuccessMsg('Complaint successfully escalated to a higher jurisdiction officer!');
      fetchCitizenGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.submitFeedback(
        selectedFeedbackGrievance.id,
        ratingSpeed,
        ratingQuality,
        ratingComm,
        ratingComment
      );
      setSuccessMsg('Feedback logged successfully! Thank you for rating.');
      setSelectedFeedbackGrievance(null);
      setRatingSpeed(5);
      setRatingQuality(5);
      setRatingComm(5);
      setRatingComment('');
      fetchCitizenGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ";
    switch (status) {
      case 'Reported':
      case 'Pending':
        return <span className={base + "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20"}><Megaphone size={12} /> Pending</span>;
      case 'Assigned':
        return <span className={base + "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20"}><Clock size={12} /> Assigned</span>;
      case 'In_Progress':
      case 'In Progress':
        return <span className={base + "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"}><RefreshCw size={12} className="animate-spin" /> In Progress</span>;
      case 'Resolved':
        return <span className={base + "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"}><CheckCircle2 size={12} /> Resolved</span>;
      case 'Escalated':
        return <span className={base + "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse"}><ShieldAlert size={12} /> Escalated</span>;
      case 'Rejected':
        return <span className={base + "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"}><X size={12} /> Rejected</span>;
      default:
        return <span className={base + "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"}>{status}</span>;
    }
  };

  const isGrievanceOverdue = (grievance) => {
    if (grievance.status === 'Resolved') return false;
    const createdDate = new Date(grievance.created_at);
    const deadline = new Date(createdDate.getTime() + ((grievance.SLA_days || 7) * 24 * 60 * 60 * 1000));
    return new Date() > deadline;
  };

  const handleAcceptComplaint = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.acceptComplaint(id);
      setSuccessMsg('Complaint accepted successfully.');
      fetchOfficialGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRejectComplaint = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.rejectComplaint(id);
      setSuccessMsg('Complaint rejected.');
      fetchOfficialGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const handlePostUpdate = async (id) => {
    if (!updateMessageText.trim()) {
      showError('Please enter a progress update message.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.postComplaintUpdate(id, updateMessageText);
      setSuccessMsg('Progress update posted successfully.');
      setShowUpdateDialogId(null);
      setUpdateMessageText('');
      fetchOfficialGrievances();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!solutionDescription.trim() || !solutionImage) {
      showError('Both photo proof and description are required to resolve a complaint.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await api.resolveComplaint(showResolveModal.id, solutionImage, solutionDescription);
      setSuccessMsg('Complaint resolved successfully with solution proof.');
      setShowResolveModal(null);
      setSolutionImage('');
      setSolutionDescription('');
      fetchOfficialGrievances();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSolutionPhotoSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showError("Please choose a smaller image (limit is 1MB to ensure stable DB execution).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSolutionImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderOfficialComplaintCard = (g) => {
    const overdue = isGrievanceOverdue(g);
    return (
      <div key={g.id} className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-brand-secondary/45 transition duration-300">
        {overdue && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-brand-danger animate-pulse rounded-t-2xl"></div>
        )}
        <div className="text-left">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ID: #{g.id}</span>
            <div className="flex gap-2">
              {overdue && (
                <span className="px-2 py-0.5 rounded bg-brand-danger/20 border border-brand-danger/40 text-brand-danger text-[9px] font-extrabold flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={10} /> OVERDUE
                </span>
              )}
              {getStatusBadge(g.status)}
            </div>
          </div>

          <h5 className="text-base font-bold text-white mb-1.5 leading-snug">{g.title}</h5>
          <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{g.description}</p>

          {/* Address landmark */}
          <p className="text-xs text-slate-300 flex items-start gap-1.5 mb-4 bg-brand-dark/40 p-2.5 rounded-lg border border-brand-border/30">
            <MapPin size={12} className="text-brand-secondary mt-0.5 shrink-0" />
            <span>{g.address} (Lat: {g.latitude}, Lng: {g.longitude})</span>
          </p>

          {/* Image preview */}
          {g.image_url && (
            <div className="w-full h-32 rounded-lg overflow-hidden border border-brand-border bg-brand-dark/50 mb-4 flex items-center justify-center">
              <img src={g.image_url} alt="Grievance evidence" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Dept / Date reported */}
          <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 py-3 border-t border-b border-brand-border/40 mb-4">
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Department Specialty</span>
              <span className="text-slate-300 font-semibold">{g.department_name} ({g.SLA_days || 7}d SLA)</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Reported Date</span>
              <span className="text-slate-300 font-semibold">{new Date(g.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Citizen info */}
          <div className="mb-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Citizen Contact Info</span>
            <div className="p-2 rounded bg-brand-dark/25 border border-brand-border/30 text-xs">
              <p className="text-slate-200 font-bold flex items-center gap-1.5">
                <User size={12} className="text-brand-secondary shrink-0" /> {g.citizen_name}
              </p>
              <p className="text-neutral-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-mono text-[10px]">
                <Phone size={10} className="text-brand-secondary shrink-0" /> {g.citizen_phone || 'Google Linked'}
              </p>
            </div>
          </div>

          {/* Display solution if already resolved */}
          {g.solution_image_url && (
            <div className="mt-4 p-3 rounded bg-brand-accent/10 border border-brand-accent/20">
              <span className="text-[10px] font-extrabold text-brand-accent uppercase block mb-1">Uploaded Solution Proof</span>
              <div className="w-full h-24 rounded overflow-hidden mb-2">
                <img src={g.solution_image_url} alt="Solution proof" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-slate-300 font-medium">{g.solution_description}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-2 mt-4 border-t border-brand-border/25">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => viewTimeline(g)}
              className="flex-grow py-2 bg-brand-card hover:bg-brand-border border border-brand-border text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Clock size={13} /> View Timeline Logs
            </button>
          </div>

          <div className="flex gap-2">
            {/* Pending / Reported state */}
            {(g.status === 'Pending' || g.status === 'Reported') && (
              <>
                <button 
                  type="button"
                  onClick={() => handleAcceptComplaint(g.id)}
                  className="flex-1 py-2 bg-brand-secondary hover:bg-brand-secondary/85 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-neon text-center justify-center"
                >
                  <Check size={13} /> Accept
                </button>
                <button 
                  type="button"
                  onClick={() => handleRejectComplaint(g.id)}
                  className="flex-1 py-2 bg-brand-danger/10 border border-brand-danger/20 hover:bg-brand-danger/25 text-brand-danger rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center justify-center"
                >
                  <X size={13} /> Reject
                </button>
              </>
            )}

            {/* Assigned / In Progress state */}
            {(g.status === 'Assigned' || g.status === 'In Progress' || g.status === 'In_Progress') && (
              <>
                <button 
                  type="button"
                  onClick={() => setShowUpdateDialogId(g.id)}
                  className="flex-1 py-2 bg-brand-secondary/10 border border-brand-secondary/35 text-brand-secondary hover:bg-brand-secondary/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center justify-center"
                >
                  <RefreshCw size={13} /> Post Update
                </button>
                <button 
                  type="button"
                  onClick={() => setShowResolveModal(g)}
                  className="flex-1 py-2 bg-brand-accent text-brand-dark hover:bg-brand-accent/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-neon-green text-center justify-center"
                >
                  <CheckCircle2 size={13} /> Resolve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const navigateTo = (targetView) => {
    setView(targetView);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark bg-[#080809] text-neutral-100' : 'bg-white text-neutral-950'} min-h-screen flex flex-col font-sans linear-transition selection:bg-neutral-200 dark:selection:bg-neutral-800`}>
      
      {/* ================= 1. PUBLIC GLASSMORPHIC NAVBAR ================= */}
      {!user && (
        <header className="border-b border-neutral-200/60 dark:border-neutral-900 bg-white/80 dark:bg-[#080809]/80 backdrop-blur sticky top-0 z-40 linear-transition">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex items-center gap-2.5 cursor-pointer hover:scale-[1.01] transition-all" onClick={() => { setView('landing'); setMobileMenuOpen(false); }}>
              <LogoSVG className="w-8 h-8" />
              <div>
                <h1 className="font-display font-black text-base tracking-tight text-neutral-950 dark:text-white leading-none">
                  CivicSync
                </h1>
                <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 mt-0.5">Municipal Grid</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setView('landing')}
                className={`text-xs font-bold tracking-wider uppercase linear-transition ${view === 'landing' ? 'text-blue-600 dark:text-teal-400' : 'text-neutral-500 hover:text-neutral-850 dark:text-neutral-450 dark:hover:text-neutral-200'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setView('explore')}
                className={`text-xs font-bold tracking-wider uppercase linear-transition ${view === 'explore' ? 'text-blue-600 dark:text-teal-400' : 'text-neutral-550 hover:text-neutral-850 dark:text-neutral-450 dark:hover:text-neutral-200'}`}
              >
                Explore
              </button>
              <button 
                onClick={() => setView('about')}
                className={`text-xs font-bold tracking-wider uppercase linear-transition ${view === 'about' ? 'text-blue-600 dark:text-teal-400' : 'text-neutral-550 hover:text-neutral-850 dark:text-neutral-450 dark:hover:text-neutral-200'}`}
              >
                About
              </button>
              <button 
                onClick={() => setView('leaderboard')}
                className={`text-xs font-bold tracking-wider uppercase linear-transition ${view === 'leaderboard' ? 'text-blue-600 dark:text-teal-400' : 'text-neutral-550 hover:text-neutral-850 dark:text-neutral-450 dark:hover:text-neutral-200'}`}
              >
                Rankings
              </button>
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-blue-650 text-white font-bold text-xs flex items-center justify-center border border-neutral-200 shadow hover:scale-105 transition"
                  >
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                  </button>
                  {profileDropdownOpen && (
                    <div 
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl p-4 shadow-xl z-50 text-left animate-slide-up"
                    >
                      <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">{user.name}</h4>
                      <p className="text-[10px] text-neutral-455 truncate mb-3">{user.email}</p>
                      <button 
                        onClick={() => {
                          setView(user.role === 'citizen' ? 'citizen-dash' : user.role === 'admin' ? 'admin-dash' : 'official-dash');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-bold transition text-center mb-2 block"
                      >
                        Enter Dashboard
                      </button>
                      <button 
                        onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                        className="w-full py-1.5 bg-red-500/10 border border-red-500/20 text-red-650 rounded-lg text-xs font-bold transition text-center block"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setView('login'); setAuthRole('citizen'); }}
                    className="text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {
                      setView('register');
                      setRegisterRole('citizen');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm animate-pulse"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-855">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-4 space-y-3 flex flex-col text-left">
              <button onClick={() => { setView('landing'); setMobileMenuOpen(false); }} className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Home</button>
              <button onClick={() => { setView('explore'); setMobileMenuOpen(false); }} className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Explore</button>
              <button onClick={() => { setView('about'); setMobileMenuOpen(false); }} className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">About</button>
              <button onClick={() => { setView('leaderboard'); setMobileMenuOpen(false); }} className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Rankings</button>
              {user ? (
                <button onClick={() => { setView(user.role === 'citizen' ? 'citizen-dash' : user.role === 'admin' ? 'admin-dash' : 'official-dash'); setMobileMenuOpen(false); }} className="text-xs font-bold uppercase tracking-wider text-blue-600">Enter Dashboard</button>
              ) : (
                <button onClick={() => { setView('login'); setMobileMenuOpen(false); }} className="text-xs font-bold uppercase tracking-wider text-blue-600">Sign In</button>
              )}
            </div>
          )}
        </header>
      )}

      {/* ================= 2. MAIN WORKSPACE WITH SIDEBAR ================= */}
      <div className="flex flex-grow relative min-h-0">
        
        {/* Left Sidebar Navigation Backdrop for mobile */}
        {user && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar Navigation (For Authenticated Users) */}
        {user && (
          <aside className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 w-64 border-r border-neutral-200/60 dark:border-neutral-900 bg-white dark:bg-[#0c0c0e] flex flex-col justify-between transition-all duration-300 ease-in-out ${
            sidebarOpen 
              ? 'translate-x-0' 
              : '-translate-x-full md:-translate-x-full md:w-0 md:border-r-0 md:overflow-hidden'
          }`}>
            <div className="p-6 space-y-8">
              {/* Logo Rebrand */}
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigateTo('landing')}>
                <LogoSVG className="w-8 h-8" />
                <h2 className="font-display font-black text-sm text-neutral-950 dark:text-white leading-none tracking-tight">
                  CivicSync
                </h2>
              </div>

              {/* Sidebar Links based on role */}
              <nav className="flex flex-col gap-1.5 text-left">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2 px-3">
                  {t('workspace')}
                </span>

                {user.role === 'citizen' && (
                  <>
                    <button 
                      onClick={() => navigateTo('citizen-dash')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'citizen-dash' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <BarChart3 size={15} /> {t('dashboard')}
                    </button>
                    <button 
                      onClick={() => navigateTo('explore')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'explore' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Compass size={15} /> {t('explore_hub')}
                    </button>
                    <button 
                      onClick={() => navigateTo('my-complaints')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'my-complaints' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Megaphone size={15} /> {t('my_complaints')}
                    </button>
                    <button 
                      onClick={() => navigateTo('leaderboard')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'leaderboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Award size={15} /> {t('city_rankings')}
                    </button>
                  </>
                )}

                {user.role === 'official' && (
                  <>
                    <button 
                      onClick={() => navigateTo('official-dash')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'official-dash' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Briefcase size={15} /> Task Workspace
                    </button>
                    <button 
                      onClick={() => navigateTo('official-analytics')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'official-analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <BarChart3 size={15} /> SLA Analytics
                    </button>
                    <button 
                      onClick={() => navigateTo('leaderboard')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'leaderboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Award size={15} /> City Rankings
                    </button>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={() => navigateTo('admin-dash')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'admin-dash' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Briefcase size={15} /> Approvals Desk
                    </button>
                    <button 
                      onClick={() => navigateTo('admin-analytics')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'admin-analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <BarChart3 size={15} /> System Analytics
                    </button>
                    <button 
                      onClick={() => navigateTo('leaderboard')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'leaderboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                    >
                      <Award size={15} /> City Rankings
                    </button>
                  </>
                )}

                <button 
                  onClick={() => navigateTo('settings')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${view === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 dark:text-neutral-400'}`}
                >
                  <KeyRound size={15} /> {t('settings')}
                </button>
              </nav>
            </div>

            {/* Sidebar bottom profile card */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-900/60 flex items-center justify-between gap-3 text-left">
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-neutral-800 dark:text-white truncate leading-tight">{user.name}</h4>
                <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider">
                  {user.role} tier
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-red-500 transition shrink-0"
                title="Sign Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </aside>
        )}

        {/* ================= 3. CORE DISPLAY WORKSPACE CONTAINER ================= */}
        <main className="flex-grow min-w-0 bg-[#F8FAFC] dark:bg-[#080809] flex flex-col min-h-0">
          
          {/* Top header bar for authenticated sessions */}
          {user && (
            <div className="h-16 border-b border-neutral-200/60 dark:border-neutral-900 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3 text-left">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition animate-pulse"
                  title="Toggle Navigation Sidebar"
                >
                  <Menu size={15} />
                </button>
                <div className="leading-none">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t('workspace')}</span>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-1 capitalize">
                    {t(view) !== view ? t(view) : view.replace('-', ' ')}
                  </h3>
                </div>
              </div>

              {/* Profile avatar elements */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-neutral-200 shadow">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </div>
              </div>
            </div>
          )}

          {/* Alert Status Banners */}
          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 mt-4 space-y-3">
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-slide-up">
                <span className="flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" /> {errorMsg}
                </span>
                <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-655">&times;</button>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-slide-up">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" /> {successMsg}
                </span>
                <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-650">&times;</button>
              </div>
            )}
          </div>

          {/* Main workspace frame content router */}
          <div className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 min-h-0 overflow-y-auto">
            {view === 'landing' && (
              <LandingView 
                user={user} setView={setView} setRegisterRole={setRegisterRole} 
                popularGrievances={popularGrievances} userLocation={userLocation} 
                handleUpvote={handleUpvote} leaderboard={leaderboard} 
                t={t} language={language}
              />
            )}
            
            {view === 'explore' && (
              <ExploreView 
                user={user} setView={setView} popularGrievances={popularGrievances} 
                handleUpvote={handleUpvote} departments={departments} 
                jurisdictions={jurisdictions} getStatusBadge={getStatusBadge} 
                t={t} language={language}
              />
            )}

            {view === 'about' && <AboutView t={t} language={language} />}

            {view === 'leaderboard' && <RankingsView leaderboard={leaderboard} loading={loading} t={t} language={language} />}

            {view === 'citizen-dash' && (
              <CitizenDashboard 
                user={user} setView={setView} grievances={grievances} 
                viewTimeline={viewTimeline} handleUpvote={handleUpvote} 
                setSelectedFeedbackGrievance={setSelectedFeedbackGrievance} 
                setShowFileModal={setShowFileModal} setNewLat={setNewLat} 
                setNewLng={setNewLng} setNewAddress={setNewAddress} 
                getStatusBadge={getStatusBadge} 
                t={t} language={language}
              />
            )}

            {view === 'my-complaints' && (
              <MyComplaintsView 
                grievances={grievances} viewTimeline={viewTimeline} 
                handleEscalate={handleEscalate} getStatusBadge={getStatusBadge} 
                t={t} language={language}
              />
            )}

            {view === 'official-dash' && (
              <OfficialWorkspace 
                user={user} departmentComplaints={departmentComplaints} 
                otherComplaints={otherComplaints} handleAcceptComplaint={handleAcceptComplaint} 
                handleRejectComplaint={handleRejectComplaint} setShowUpdateDialogId={setShowUpdateDialogId} 
                setShowResolveModal={setShowResolveModal} viewTimeline={viewTimeline} 
                getStatusBadge={getStatusBadge} 
              />
            )}

            {view === 'official-analytics' && (
              <OfficialAnalytics 
                officialStats={officialStats} departmentComplaints={departmentComplaints} 
                otherComplaints={otherComplaints} 
              />
            )}

            {view === 'admin-dash' && (
              <AdminDashboard 
                pendingOfficials={pendingOfficials} handleAdminApproval={handleAdminApproval} 
              />
            )}

            {view === 'admin-analytics' && (
              <AdminAnalytics 
                pendingOfficials={pendingOfficials} leaderboard={leaderboard} 
              />
            )}

            {/* Custom Settings Page */}
            {/* Custom Settings Page */}
            {view === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-6 text-left animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6">
                  <div>
                    <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
                      {t('settings')}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {t('preferences_desc')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Details Card */}
                  <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                        {t('account_settings')}
                      </h3>
                      <p className="text-[11px] text-neutral-450 dark:text-neutral-500 mt-0.5">
                        {t('account_settings_desc')}
                      </p>
                    </div>

                    <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900/60 pt-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">{t('active_email')}</span>
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-350">{user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">{t('full_name')}</span>
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-350">{user?.name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">{t('linked_phone')}</span>
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-350 font-mono">{user?.phone || 'Google Auth (Linked)'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">{t('role_scope')}</span>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[8px] font-extrabold uppercase border border-blue-500/20 mt-1">
                            {user?.role} Tier
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences Card */}
                  <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                        {t('preferences')}
                      </h3>
                      <p className="text-[11px] text-neutral-450 dark:text-neutral-500 mt-0.5">
                        {t('preferences_desc')}
                      </p>
                    </div>

                    <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900/60 pt-4">
                      {/* Theme Dropdown */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                          {t('mode')}
                        </label>
                        <select
                          value={themeMode}
                          onChange={(e) => setThemeMode(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition text-neutral-800 dark:text-neutral-200"
                        >
                          <option value="light">{t('theme_light')}</option>
                          <option value="dark">{t('theme_dark')}</option>
                          <option value="system">{t('theme_system')}</option>
                        </select>
                      </div>

                      {/* Language Dropdown */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                          {t('language')}
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition text-neutral-800 dark:text-neutral-200"
                        >
                          <option value="en">{t('lang_en')}</option>
                          <option value="kn">{t('lang_kn')}</option>
                          <option value="hi">{t('lang_hi')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout Button Block */}
                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-900 flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-650 hover:text-red-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <LogOut size={14} /> {t('logout')}
                  </button>
                </div>
              </div>
            )}

            {/* ================= REGISTER VIEW ================= */}
            {view === 'register' && (
              <div className="py-6 sm:py-10 max-w-lg mx-auto animate-slide-up">
                <div className="bg-white dark:bg-[#0c0c0e] rounded-2xl border border-neutral-200 dark:border-neutral-900 p-6 sm:p-8 shadow-sm relative text-left">
                  
                  <h3 className="text-xl sm:text-2xl font-display font-black text-neutral-950 dark:text-white text-center mb-1">Create CivicSync Profile</h3>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mb-6">Choose your account tier to initialize enrollment</p>

                  {/* Role Toggle Tabs */}
                  <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg mb-6 border border-neutral-200/40 dark:border-neutral-900/60">
                    <button 
                      type="button"
                      onClick={() => setRegisterRole('citizen')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition ${registerRole === 'citizen' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700'}`}
                    >
                      Citizen Signup
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegisterRole('official')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition ${registerRole === 'official' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700'}`}
                    >
                      Official Onboarding
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                      <input 
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Subhash Rao"
                        className="w-full input-minimal text-neutral-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          {registerRole === 'official' ? 'Office Email ID (Gov domain) *' : 'Email Address *'}
                        </label>
                        <input 
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder={registerRole === 'official' ? 'name@bbmp.gov.in' : 'e.g. john@gmail.com'}
                          className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Password *</label>
                        <input 
                          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition"
                          required
                        />
                      </div>
                    </div>

                    {registerRole === 'citizen' ? (
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Phone Number</label>
                        <input 
                          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition"
                          required
                        />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Official Designation *</label>
                            <input 
                              type="text" value={offDesignation} onChange={(e) => setOffDesignation(e.target.value)}
                              placeholder="e.g. Ward 150 Sanitation Inspector"
                              className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Administrative Jurisdiction *</label>
                            <select 
                              value={offJurisdictionId} onChange={(e) => setOffJurisdictionId(e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                              required
                            >
                              <option value="" className="dark:bg-[#0c0c0e]">Select Boundary</option>
                              {jurisdictions.map(j => (
                                <option key={j.id} value={j.id} className="dark:bg-[#0c0c0e]">{j.name} ({j.tier})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Department Specialty (Nullable for general MPs/MLAs)</label>
                          <select 
                            value={offDepartmentId} onChange={(e) => setOffDepartmentId(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                          >
                            <option value="" className="dark:bg-[#0c0c0e]">Choose department sector (if applicable)</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id} className="dark:bg-[#0c0c0e]">{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Official uploader slots for ID Proof and Photo */}
                        <div className="border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-xl space-y-4">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 border-b border-neutral-200/60 dark:border-neutral-850 pb-2">
                            <ShieldAlert size={14} className="text-amber-500" /> Mandatory Official Verification Uploads
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Office ID Card */}
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase mb-1">Office ID Card Proof *</label>
                              <div className="flex flex-col gap-2 items-center border border-dashed border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-950 p-3 rounded-lg">
                                {offIdProof ? (
                                  <img src={offIdProof} alt="Office ID Proof" className="w-full h-20 object-cover rounded border border-neutral-200 dark:border-neutral-800" />
                                ) : (
                                  <div className="h-20 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 text-[10px]">
                                    <Upload size={18} className="mb-1" />
                                    No file uploaded
                                  </div>
                                )}
                                <label className="w-full text-center py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-[10px] font-bold rounded cursor-pointer transition border border-neutral-200 dark:border-neutral-850">
                                  Upload ID Card
                                  <input type="file" accept="image/*" onChange={(e) => handleProofSelection(e, 'id')} className="hidden" />
                                </label>
                              </div>
                            </div>

                            {/* Self Portrait */}
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase mb-1">Self Portrait Photo *</label>
                              <div className="flex flex-col gap-2 items-center border border-dashed border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-950 p-3 rounded-lg">
                                {offPhotoProof ? (
                                  <img src={offPhotoProof} alt="Self Portrait" className="w-full h-20 object-cover rounded border border-neutral-200 dark:border-neutral-800" />
                                ) : (
                                  <div className="h-20 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 text-[10px]">
                                    <Camera size={18} className="mb-1" />
                                    No photo snapped
                                  </div>
                                )}
                                <label className="w-full text-center py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-[10px] font-bold rounded cursor-pointer transition border border-neutral-200 dark:border-neutral-850">
                                  Capture Portrait
                                  <input type="file" accept="image/*" capture="user" onChange={(e) => handleProofSelection(e, 'photo')} className="hidden" />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm mt-2 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Processing...' : registerRole === 'citizen' ? 'Create Citizen Profile' : 'Submit Verification Request'}
                    </button>
                  </form>

                  {registerRole === 'citizen' && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900/65">
                      <button 
                        type="button" 
                        onClick={handleGoogleAuth}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= LOGIN VIEW (UPGRADED WITH THREE TABS) ================= */}
            {view === 'login' && (
              <div className="py-6 sm:py-10 max-w-md mx-auto animate-slide-up">
                <div className="bg-white dark:bg-[#0c0c0e] rounded-2xl border border-neutral-200 dark:border-neutral-900 p-6 sm:p-8 shadow-sm relative text-left">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-teal-500"></div>
                  
                  <h3 className="text-xl sm:text-2xl font-display font-black text-neutral-950 dark:text-white text-center mb-1">Sign In to CivicSync</h3>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-500 text-center mb-6">Choose your access tier to authenticate</p>

                  {/* Login toggle switcher (Three-tier) */}
                  <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg mb-6 border border-neutral-200/40 dark:border-neutral-900/60 text-[10px] sm:text-xs">
                    <button 
                      type="button" onClick={() => setAuthRole('citizen')}
                      className="flex-1 py-1.5 rounded-md font-bold tracking-wider uppercase transition"
                      style={{
                        backgroundColor: authRole === 'citizen' ? 'var(--tab-active-bg, #3b82f6)' : 'transparent',
                        color: authRole === 'citizen' ? '#fff' : 'var(--tab-inactive-color, #a3a3a3)'
                      }}
                    >
                      Citizen
                    </button>
                    <button 
                      type="button" onClick={() => setAuthRole('official')}
                      className="flex-1 py-1.5 rounded-md font-bold tracking-wider uppercase transition"
                      style={{
                        backgroundColor: authRole === 'official' ? 'var(--tab-active-bg, #3b82f6)' : 'transparent',
                        color: authRole === 'official' ? '#fff' : 'var(--tab-inactive-color, #a3a3a3)'
                      }}
                    >
                      Official
                    </button>
                    <button 
                      type="button" onClick={() => setAuthRole('admin')}
                      className="flex-1 py-1.5 rounded-md font-bold tracking-wider uppercase transition"
                      style={{
                        backgroundColor: authRole === 'admin' ? 'var(--tab-active-bg, #3b82f6)' : 'transparent',
                        color: authRole === 'admin' ? '#fff' : 'var(--tab-inactive-color, #a3a3a3)'
                      }}
                    >
                      Admin Desk
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email Address *</label>
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder={authRole === 'official' ? 'name@bbmp.gov.in' : authRole === 'admin' ? 'admin@portal.com' : 'e.g. john@gmail.com'}
                        className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Password *</label>
                      <input 
                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                        required
                      />
                    </div>

                    <button 
                      type="submit" disabled={authLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm mt-2 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Authenticating...' : 'Authenticate Credentials'}
                    </button>
                  </form>

                  {/* Google OAuth Login Button */}
                  {authRole === 'citizen' && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900/65">
                      <button 
                        type="button" onClick={handleGoogleAuth}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-neutral-850 dark:text-neutral-200 font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL 2: OFFICIAL MULTI-FACTOR OTP VERIFICATION */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/85 backdrop-blur p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden animate-slide-in">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-secondary"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/15 text-brand-secondary flex items-center justify-center mb-4">
                <KeyRound size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">MFA OTP Verification</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[250px] leading-relaxed">
                An official verification key code has been issued to authenticate your identity clearance.
              </p>
            </div>

            {/* MOCK SMS / MAIL BANNER */}
            <div className="mt-5 p-3 rounded-xl border border-brand-secondary/30 bg-brand-secondary/10 flex items-start gap-2.5">
              <Megaphone size={16} className="text-brand-secondary shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-300 leading-normal font-sans">
                <strong className="text-white block uppercase tracking-wider mb-0.5">Mock Mail Dispatch System:</strong>
                Grievance clearance passcode generated: <strong className="text-brand-secondary underline font-mono text-xs tracking-wider">{simulatedOtp}</strong>
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enter 6-Digit Passcode *</label>
                <input 
                  type="text" maxLength="6" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3 py-2.5 text-center text-lg font-mono tracking-widest text-brand-secondary placeholder-slate-600 focus:outline-none focus:border-brand-secondary transition"
                  required
                />
              </div>

              <button 
                type="submit" disabled={authLoading}
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold py-2 rounded-lg text-xs transition shadow-neon flex items-center justify-center gap-1.5"
              >
                {authLoading ? 'Authenticating...' : 'Submit Verification Key'}
              </button>
            </form>

            <button 
              onClick={() => { setShowOtpModal(false); setOtpCode(''); setSimulatedOtp(''); }}
              className="w-full text-center mt-4 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel Login
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: FILE GRIEVANCE FORMS */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur p-4 overflow-y-auto">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-2xl shadow-2xl relative my-8 animate-slide-in">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary"></div>
            
            <div className="flex items-center justify-between p-5 border-b border-brand-border/60">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="text-brand-primary" /> Report New Municipal Grievance
              </h3>
              <button onClick={() => setShowFileModal(false)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFileGrievance} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Grievance Title *</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ruptured sewer line discharging waste"
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Department *</label>
                  <select 
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition"
                    required
                  >
                    <option value="">Select Sector</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.SLA_days || 7}d SLA)</option>
                    ))}
                  </select>
                  {deptSuggestionMsg && (
                    <span className="block text-[10px] text-brand-secondary font-semibold mt-1">
                      {deptSuggestionMsg}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Administrative Ward *</label>
                  <input 
                    type="text"
                    value={wardSearchQuery}
                    onChange={(e) => {
                      setWardSearchQuery(e.target.value);
                      setShowWardDropdown(true);
                      const match = jurisdictions.find(j => j.name.toLowerCase() === e.target.value.toLowerCase());
                      if (match) {
                        setNewWardId(match.id.toString());
                      } else {
                        setNewWardId('');
                      }
                    }}
                    onFocus={() => setShowWardDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowWardDropdown(false), 200);
                    }}
                    placeholder="Search Ward (e.g. Bellandur)"
                    className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition text-left"
                    required
                  />
                  {showWardDropdown && (
                    <div className="absolute left-0 right-0 z-30 max-h-48 overflow-y-auto bg-brand-card border border-brand-border rounded-lg mt-1 shadow-xl">
                      {jurisdictions
                        .filter(j => j.name.toLowerCase().includes(wardSearchQuery.toLowerCase()))
                        .map(j => (
                          <div
                            key={j.id}
                            onClick={() => {
                              setNewWardId(j.id.toString());
                              setWardSearchQuery(j.name);
                              setShowWardDropdown(false);
                              const coords = WARD_COORDINATES[j.id];
                              if (coords) {
                                setNewLat(coords.lat.toString());
                                setNewLng(coords.lng.toString());
                              }
                            }}
                            className="px-3.5 py-2 text-sm text-slate-300 hover:bg-brand-primary/20 hover:text-white cursor-pointer transition text-left"
                          >
                            {j.name}
                          </div>
                        ))}
                      {jurisdictions.filter(j => j.name.toLowerCase().includes(wardSearchQuery.toLowerCase())).length === 0 && (
                        <div className="px-3.5 py-2 text-xs text-slate-500 italic text-left">No wards found</div>
                      )}
                    </div>
                  )}
                  {wardSuggestionMsg && (
                    <span className="block text-[10px] text-brand-primary font-semibold mt-1">
                      {wardSuggestionMsg}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description *</label>
                <textarea 
                  rows="3"
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide precise details of the complaint so responding ward engineers can act..."
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                  required
                ></textarea>
              </div>

              {/* Leaflet Picker & GPS */}
              <div className="space-y-2 border border-brand-border/60 bg-brand-dark/40 p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-primary" /> Drag Map Pin or click to locate
                  </span>
                  <button 
                    type="button"
                    onClick={handleFindMyLocation}
                    className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 text-brand-primary font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={11} /> Find My Current Location (GPS)
                  </button>
                </div>

                <div id="map-picker" className="w-full h-44 border border-brand-border rounded-xl z-10"></div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Latitude:</span>
                    <input 
                      type="number" step="0.00000001" value={newLat} 
                      onChange={(e) => { setNewLat(e.target.value); applyCoordinatePreset(''); }}
                      className="w-full bg-brand-dark/40 border border-brand-border/60 rounded px-2.5 py-1 text-xs font-mono text-slate-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Longitude:</span>
                    <input 
                      type="number" step="0.00000001" value={newLng} 
                      onChange={(e) => { setNewLng(e.target.value); applyCoordinatePreset(''); }}
                      className="w-full bg-brand-dark/40 border border-brand-border/60 rounded px-2.5 py-1 text-xs font-mono text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Landmark Landmark Address *</label>
                <input 
                  type="text" 
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Near Ward 150 BBMP office entrance"
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                  required
                />
              </div>

              {/* DYNAMIC DUPLICATE / SIMILAR GRIEVANCE DETECTOR */}
              {duplicateSuggestions.length > 0 && (
                <div className="border border-brand-secondary/40 bg-brand-secondary/10 p-4 rounded-xl space-y-3 animate-slide-in">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-brand-border/40 pb-2">
                    <AlertTriangle size={14} className="text-brand-warning animate-pulse" /> Similar Unresolved Grievances Found Nearby!
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    We found similar unresolved reports matching your selected category within 500 meters. 
                    Instead of filing a duplicate ticket, you can upvote an existing report to amplify its priority for responders:
                  </p>
                  <div className="space-y-2.5">
                    {duplicateSuggestions.map((dup) => (
                      <div 
                        key={dup.id} 
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-brand-dark/50 border border-brand-border/60 hover:border-brand-primary/45 transition duration-200"
                      >
                        <div className="leading-normal">
                          <p className="text-xs font-bold text-white line-clamp-1">{dup.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            📍 {(dup.distance * 1000).toFixed(0)} meters away • Status: <strong className="text-slate-300">{dup.status}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await handleUpvote(dup.id);
                            setShowFileModal(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-brand-primary/15 border border-brand-primary/30 hover:bg-brand-primary text-brand-primary hover:text-white text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                        >
                          👍 Upvote & Close
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Picture Upload slot */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Picture Evidence</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center border border-dashed border-brand-border bg-brand-dark/30 p-4 rounded-xl">
                  {newImg ? (
                    <div className="relative w-36 h-28 shrink-0 rounded-lg overflow-hidden border border-brand-border bg-brand-dark flex items-center justify-center">
                      <img src={newImg} alt="Evidence thumbnail" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImg('')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-brand-danger text-white hover:bg-red-600 transition shadow"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full text-center flex flex-col items-center justify-center py-4 text-slate-500">
                      <Upload size={24} className="mb-2 text-slate-600" />
                      <p className="text-[11px] font-medium">Capture evidence photo via Camera or Files</p>
                      <p className="text-[9px] text-slate-600 mt-0.5">Maximum size limit: 1MB</p>
                    </div>
                  )}

                  <div className="flex gap-2 w-full sm:w-auto flex-col">
                    <label className="px-3.5 py-2 bg-brand-card hover:bg-brand-border border border-brand-border hover:border-brand-primary/50 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5">
                      <Upload size={14} /> Choose Photo File
                      <input 
                        type="file" accept="image/*" 
                        onChange={handlePictureSelection}
                        className="hidden" 
                      />
                    </label>
                    <label className="px-3.5 py-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5">
                      <Camera size={14} /> Open Device Camera
                      <input 
                        type="file" accept="image/*" capture="environment" 
                        onChange={handlePictureSelection}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowFileModal(false)}
                  className="px-4 py-2 border border-brand-border text-slate-300 hover:text-white rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-xl text-sm shadow-neon"
                >
                  Assign & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: AUDIT HISTORY TIMELINE */}
      {selectedTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-secondary"></div>
            
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-brand-border/60">
              <h3 className="text-base sm:text-lg font-bold text-white flex flex-col">
                <span>Grievance Audit Timeline</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 font-mono">ID: #{selectedTimeline.id} - {selectedTimeline.title}</span>
              </h3>
              <button onClick={() => setSelectedTimeline(null)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
              {timelineLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No status transition logs registered.
                </div>
              ) : (
                <div className="relative border-l border-brand-border pl-6 ml-3 space-y-6">
                  {timelineLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-brand-card border-2 border-brand-secondary shadow-neon"></span>
                      <div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            Transitioned to: {getStatusBadge(log.new_status)}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {new Date(log.changed_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 font-medium bg-brand-dark/30 p-2.5 rounded border border-brand-border/40 leading-relaxed">
                          {log.notes}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Action by: <strong className="text-slate-400">{log.actor_name}</strong> ({log.updated_by_role})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 border-t border-brand-border/60 flex justify-end">
              <button 
                onClick={() => setSelectedTimeline(null)}
                className="px-4 py-2 bg-brand-dark border border-brand-border text-slate-300 hover:text-white rounded-xl text-sm"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RESOLVE COMPONENT WITH SOLUTION PROOF */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur p-4 overflow-y-auto">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden my-8 animate-slide-in">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-accent"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-brand-border/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="text-brand-accent" /> Resolve Complaint (Solution Proof)
              </h3>
              <button onClick={() => { setShowResolveModal(null); setSolutionImage(''); setSolutionDescription(''); }} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveComplaint} className="p-6 space-y-4 text-left">
              <p className="text-xs text-slate-400 leading-relaxed">
                To resolve this complaint, you must upload a base64 image proof of the resolved issue (e.g. clean road, leak fixed) and provide a description of the resolution.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Description *</label>
                <textarea 
                  rows="3"
                  value={solutionDescription} 
                  onChange={(e) => setSolutionDescription(e.target.value)}
                  placeholder="Describe how the problem was resolved (e.g., patched the road pothole using cold-mix asphalt, tested and verified)..."
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent transition"
                  required
                ></textarea>
              </div>

              {/* Solution Picture Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Solution Photo Proof *</label>
                <div className="flex flex-col gap-3 items-center border border-dashed border-brand-border bg-brand-dark/30 p-4 rounded-xl">
                  {solutionImage ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-brand-border bg-brand-dark flex items-center justify-center">
                      <img src={solutionImage} alt="Solution thumbnail" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setSolutionImage('')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-brand-danger text-white hover:bg-red-600 transition shadow"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full text-center flex flex-col items-center justify-center py-4 text-slate-500">
                      <Camera size={24} className="mb-2 text-slate-600" />
                      <p className="text-[11px] font-medium">Capture or upload resolution photo</p>
                      <p className="text-[9px] text-slate-600 mt-0.5">Maximum size limit: 1MB</p>
                    </div>
                  )}

                  <div className="flex gap-2 w-full flex-col">
                    <label className="px-3.5 py-2 bg-brand-card hover:bg-brand-border border border-brand-border hover:border-brand-accent/50 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5">
                      <Upload size={14} /> Choose Photo File
                      <input 
                        type="file" accept="image/*" 
                        onChange={handleSolutionPhotoSelection}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowResolveModal(null); setSolutionImage(''); setSolutionDescription(''); }}
                  className="px-4 py-2 border border-brand-border text-slate-300 hover:text-white rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-sm shadow-neon-green"
                >
                  {loading ? 'Resolving...' : 'Confirm Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5B: POST PROGRESS UPDATE */}
      {showUpdateDialogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-slide-in">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-secondary"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-brand-border/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="text-brand-secondary" /> Post Progress Update
              </h3>
              <button onClick={() => { setShowUpdateDialogId(null); setUpdateMessageText(''); }} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handlePostUpdate(showUpdateDialogId); }} className="p-6 space-y-4 text-left">
              <p className="text-xs text-slate-400 leading-relaxed">
                Add an timeline update log to keep the citizen informed about the investigation or completion process.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Update Message *</label>
                <textarea 
                  rows="4"
                  value={updateMessageText} 
                  onChange={(e) => setUpdateMessageText(e.target.value)}
                  placeholder="e.g. Ground crew dispatched to site to locate and inspect structural leaks..."
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-secondary transition"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowUpdateDialogId(null); setUpdateMessageText(''); }}
                  className="px-4 py-2 border border-brand-border text-slate-300 hover:text-white rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-secondary text-white font-bold rounded-xl text-sm shadow-neon"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: SATISFACTION FEEDBACK (CITIZEN) */}
      {selectedFeedbackGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-accent"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-brand-border/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="text-brand-warning" /> Submit Satisfaction Feedback
              </h3>
              <button onClick={() => setSelectedFeedbackGrievance(null)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-400">
                Rate the performance of the responding official on three criteria (1 = Poor, 5 = Excellent).
              </p>

              <div className="space-y-4 bg-brand-dark/40 border border-brand-border/60 p-4 rounded-xl">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>1. Resolution Speed</span>
                    <span className="text-brand-warning flex items-center gap-1">{ratingSpeed} / 5 <Star size={11} className="fill-current" /></span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={ratingSpeed} 
                    onChange={(e) => setRatingSpeed(parseInt(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>2. Quality of Work</span>
                    <span className="text-brand-warning flex items-center gap-1">{ratingQuality} / 5 <Star size={11} className="fill-current" /></span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={ratingQuality} 
                    onChange={(e) => setRatingQuality(parseInt(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>3. Official Communication</span>
                    <span className="text-brand-warning flex items-center gap-1">{ratingComm} / 5 <Star size={11} className="fill-current" /></span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={ratingComm} 
                    onChange={(e) => setRatingComm(parseInt(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback Comments (Optional)</label>
                <textarea 
                  rows="3"
                  value={ratingComment} 
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedFeedbackGrievance(null)}
                  className="px-4 py-2 border border-brand-border text-slate-300 hover:text-white rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-xl text-sm shadow-neon"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-900 bg-white dark:bg-[#0c0c0e] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] sm:text-xs text-neutral-450 dark:text-neutral-500">
          <p>© 2026 CivicSync. Designed for Bengaluru Wards & Municipal Governance. All administrative systems active.</p>
        </div>
      </footer>
    </div>
  );
}

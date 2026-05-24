import React, { useState, useEffect } from 'react';
import { 
  Megaphone, ShieldAlert, Award, LogIn, UserPlus, LogOut, PlusCircle, 
  MapPin, Clock, CheckCircle2, ChevronRight, BarChart3, Star, AlertTriangle, 
  User, Briefcase, RefreshCw, Send, X, ArrowUpRight, Flame, Menu, Camera, Upload, Trash2, KeyRound, Check, ShieldCheck
} from 'lucide-react';
import { api } from './utils/api';
import { auth, googleProvider } from './utils/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function App() {
  // Navigation Router & Responsive States
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'register' | 'citizen-dash' | 'official-dash' | 'admin-dash' | 'leaderboard'
  const [authRole, setAuthRole] = useState('citizen'); // 'citizen' | 'official' | 'admin'
  const [registerRole, setRegisterRole] = useState('citizen'); // 'citizen' | 'official'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState('12.9304'); // default Bellandur coordinates
  const [newLng, setNewLng] = useState('77.6784');
  const [newImg, setNewImg] = useState(''); // Base64 representation of selected picture

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded valid official domains list for fast frontend alerts
  const validOfficialDomains = ['gov.in', 'nic.in', 'karnataka.gov.in', 'bbmp.gov.in', 'bescom.org', 'bwssb.gov.in'];

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
      if (user.role === 'citizen' && view === 'citizen-dash') {
        fetchCitizenGrievances();
      } else if (user.role === 'official' && view === 'official-dash') {
        fetchOfficialGrievances();
      } else if (user.role === 'admin' && view === 'admin-dash') {
        fetchPendingOfficials();
      }
    }
    if (view === 'leaderboard') {
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

      // Seed hardcoded jurisdictions to make registration forms simple & robust
      setJurisdictions([
        { id: 5, name: 'Ward 150 - Bellandur', tier: 'Ward' },
        { id: 6, name: 'Ward 174 - HSR Layout', tier: 'Ward' },
        { id: 4, name: 'Bengaluru City Corp (BBMP)', tier: 'City' },
        { id: 3, name: 'Bengaluru District Office', tier: 'District' },
        { id: 2, name: 'State of Karnataka', tier: 'State' },
        { id: 1, name: 'Central Government Authority', tier: 'National' }
      ]);
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
      setGrievances(data.grievances);
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
    setLoading(true);

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
            setLoading(false);
            return;
          }
          if (!offJurisdictionId || !offDesignation || !offIdProof || !offPhotoProof) {
            showError('All fields including Office ID Card and Self Photo are mandatory.');
            setLoading(false);
            return;
          }

          await api.registerOfficial(
            name,
            email,
            password,
            parseInt(offJurisdictionId),
            offDepartmentId ? parseInt(offDepartmentId) : null,
            offDesignation,
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
            setLoading(false);
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
      setLoading(false);
    }
  };

  // OTP Verification Submission
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

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
      setLoading(false);
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
    setLoading(true);

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
        }
      }
    } catch (err) {
      console.error("Google Authentication Popup Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        showError(err.message);
      }
    } finally {
      setLoading(false);
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

    if (!newTitle || !newDesc || !newDeptId || !newAddress) {
      showError('Please fill out all mandatory fields.');
      return;
    }

    try {
      await api.createGrievance(
        newTitle,
        newDesc,
        newDeptId,
        parseFloat(newLat),
        parseFloat(newLng),
        newAddress,
        newImg || null
      );
      setSuccessMsg('Grievance registered and routed successfully!');
      setShowFileModal(false);
      
      setNewTitle('');
      setNewDesc('');
      setNewDeptId('');
      setNewAddress('');
      setNewImg('');
      
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
        return <span className={base + "bg-blue-950/80 text-blue-400 border border-blue-800/50"}><Megaphone size={12} /> Reported</span>;
      case 'Assigned':
        return <span className={base + "bg-amber-950/80 text-brand-warning border border-amber-800/50"}><Clock size={12} /> Assigned</span>;
      case 'In_Progress':
        return <span className={base + "bg-indigo-950/80 text-indigo-400 border border-indigo-800/50"}><RefreshCw size={12} className="animate-spin" /> In Progress</span>;
      case 'Resolved':
        return <span className={base + "bg-emerald-950/80 text-brand-accent border border-emerald-800/50"}><CheckCircle2 size={12} /> Resolved</span>;
      case 'Escalated':
        return <span className={base + "bg-red-950/80 text-brand-danger border border-red-800/50 animate-pulse"}><ShieldAlert size={12} /> Escalated</span>;
      default:
        return <span className={base + "bg-slate-800 text-slate-400"}>{status}</span>;
    }
  };

  const isGrievanceOverdue = (grievance) => {
    if (grievance.status === 'Resolved') return false;
    const createdDate = new Date(grievance.created_at);
    const deadline = new Date(createdDate.getTime() + (grievance.SLA_days * 24 * 60 * 60 * 1000));
    return new Date() > deadline;
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-sans text-slate-100">
      
      {/* ================= NAVBAR (RESPONSIVE) ================= */}
      <header className="border-b border-brand-border/60 bg-brand-dark/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('landing'); setMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-neon">
              <Megaphone className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                PublicEcho <span className="text-[10px] uppercase font-semibold bg-brand-secondary/30 text-brand-secondary px-1.5 py-0.5 rounded">Core</span>
              </h1>
              <p className="text-[10px] text-slate-400">DBMS Grievance & Escalation Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setView('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${view === 'leaderboard' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'text-slate-300 hover:text-white'}`}
            >
              <Award size={15} /> Official Leaderboard
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 border-r border-brand-border pr-3">
                  Signed in as <strong className="text-slate-200">{user.name}</strong> ({user.role})
                </span>
                <button 
                  onClick={() => setView(user.role === 'citizen' ? 'citizen-dash' : user.role === 'admin' ? 'admin-dash' : 'official-dash')}
                  className="px-3 py-1.5 rounded-lg text-sm bg-brand-card border border-brand-border text-slate-200 hover:text-white font-medium flex items-center gap-1.5"
                >
                  <ArrowUpRight size={14} /> My Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 transition"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setView('login'); setAuthRole('citizen'); }}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-200 hover:text-white transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setView('register'); setRegisterRole('citizen'); }}
                  className="px-3 py-1.5 rounded-lg text-sm bg-brand-primary hover:bg-brand-primary/80 text-white font-semibold transition shadow-neon"
                >
                  Register
                </button>
              </div>
            )}
          </nav>

          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl border border-brand-border/60 bg-brand-card transition"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border bg-brand-dark/95 backdrop-blur px-6 py-6 space-y-4 shadow-xl">
            <button 
              onClick={() => { setView('leaderboard'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 text-sm font-semibold text-slate-200 border-b border-brand-border/40 flex items-center gap-2"
            >
              <Award size={16} className="text-brand-warning" /> Official Leaderboard
            </button>

            {user ? (
              <>
                <button 
                  onClick={() => { setView(user.role === 'citizen' ? 'citizen-dash' : user.role === 'admin' ? 'admin-dash' : 'official-dash'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2.5 text-sm font-semibold text-slate-200 border-b border-brand-border/40 flex items-center gap-2"
                >
                  <ArrowUpRight size={16} className="text-brand-primary" /> Go to Dashboard
                </button>
                <div className="py-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Logged In Profile</p>
                  <p className="text-xs text-slate-300 font-bold mt-1">{user.name} ({user.role})</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-brand-danger/10 border border-brand-danger/25 text-brand-danger flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Sign Out Session
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => { setView('login'); setAuthRole('citizen'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 rounded-xl text-sm font-bold bg-brand-card border border-brand-border text-slate-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setView('register'); setRegisterRole('citizen'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-brand-primary text-white shadow-neon"
                >
                  Register Citizen
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ================= MAIN CONTAINER ROUTER ================= */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 md:py-10">
        
        {/* LANDING VIEW */}
        {view === 'landing' && (
          <div className="py-6 md:py-16 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-extrabold uppercase tracking-wider mb-6 animate-pulse">
              <Flame size={12} /> MFA & Verified Onboarding Activated
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl px-2">
              Connect Directly with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
                Your Verified Administrators
              </span>
            </h2>

            <p className="mt-4 md:mt-6 text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed px-4">
              Report local municipal breakdowns. Our upgraded portal supports strict email domain verification, 
              administrator credentials checking, MFA OTP codes, and comprehensive citizen satisfaction leaderboards.
            </p>

            {/* GEOLOCATED POPULAR PROBLEMS LIST */}
            <div className="w-full max-w-5xl mt-12 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                    <Flame className="text-brand-secondary animate-pulse" size={20} /> Popular Problems Nearby
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {userLocation 
                      ? "Showing unresolved municipal breakdowns sorted by closest location first, prioritised by citizen upvotes." 
                      : "Allow location permission to sort reported breakdowns by closest first. Displaying by upvote counts."}
                  </p>
                </div>
                {userLocation && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full w-fit">
                    📍 Precise Location Active
                  </span>
                )}
              </div>

              {popularGrievances.length === 0 ? (
                <div className="p-12 text-center bg-brand-card border border-dashed border-brand-border rounded-2xl text-slate-500 text-sm">
                  <CheckCircle2 className="mx-auto mb-3 text-brand-accent animate-bounce" size={36} />
                  No unresolved grievances have been reported in your city yet!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularGrievances.map((g) => (
                    <div 
                      key={g.id} 
                      className="bg-brand-card border border-brand-border hover:border-brand-primary/45 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:scale-[1.01] transition duration-300"
                    >
                      <div>
                        {/* Header metadata */}
                        <div className="flex justify-between items-center gap-2 mb-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ID: #{g.id}</span>
                          <span className="px-2 py-0.5 rounded bg-brand-dark/60 text-slate-400 text-[10px] font-bold border border-brand-border">
                            {g.department_name}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">{g.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{g.description}</p>

                        {/* Location address */}
                        <p className="text-[11px] text-slate-300 flex items-start gap-1.5 mb-4 bg-brand-dark/45 p-2 rounded-lg border border-brand-border/40 leading-normal">
                          <MapPin size={12} className="text-brand-primary shrink-0 mt-0.5" />
                          <span>{g.address}</span>
                        </p>

                        {/* Image Evidence Preview */}
                        {g.image_url && (
                          <div className="w-full h-28 rounded-lg overflow-hidden border border-brand-border bg-brand-dark/40 mb-4 flex items-center justify-center">
                            <img src={g.image_url} alt="Grievance evidence" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Card Footer upvoting controls */}
                      <div className="border-t border-brand-border/40 pt-4 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold text-slate-400 flex flex-col">
                          {g.distance !== undefined && (
                            <span className="text-brand-primary font-bold">
                              📍 {(g.distance).toFixed(2)} km away
                            </span>
                          )}
                          <span className="text-slate-500">Status: <strong className="text-slate-300">{g.status}</strong></span>
                        </div>

                        <button
                          onClick={() => handleUpvote(g.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                            g.user_has_upvoted
                              ? 'bg-brand-primary text-white border border-brand-primary shadow-neon'
                              : 'bg-brand-dark hover:bg-brand-border border border-brand-border hover:border-brand-primary/40 text-slate-300 hover:text-white'
                          }`}
                        >
                          👍 <span className="font-extrabold">{g.upvote_count}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= REGISTER VIEW (UPGRADED ROLE MAPPINGS) ================= */}
        {view === 'register' && (
          <div className="py-6 sm:py-10 max-w-lg mx-auto">
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 sm:p-8 shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">Create PublicEcho Profile</h3>
              <p className="text-[11px] text-slate-400 text-center mb-6">Choose your account tier to initialize enrollment</p>

              {/* Role Toggle */}
              <div className="flex bg-brand-dark p-1 rounded-lg mb-6 border border-brand-border/80">
                <button 
                  type="button"
                  onClick={() => setRegisterRole('citizen')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${registerRole === 'citizen' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Citizen Signup
                </button>
                <button 
                  type="button"
                  onClick={() => setRegisterRole('official')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${registerRole === 'official' ? 'bg-brand-secondary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Official Onboarding
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input 
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Subhash Rao"
                    className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {registerRole === 'official' ? 'Office Email ID (Requires Gov domain) *' : 'Email Address *'}
                    </label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={registerRole === 'official' ? 'e.g. name@bbmp.gov.in' : 'e.g. john@gmail.com'}
                      className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                      required
                    />
                  </div>
                </div>

                {registerRole === 'citizen' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input 
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                      required
                    />
                  </div>
                ) : (
                  /* UPGRADED OFFICIAL SECURE FIELD MAPPINGS */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Official Designation *</label>
                        <input 
                          type="text" value={offDesignation} onChange={(e) => setOffDesignation(e.target.value)}
                          placeholder="e.g. Ward 150 Sanitation Inspector"
                          className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Jurisdiction *</label>
                        <select 
                          value={offJurisdictionId} onChange={(e) => setOffJurisdictionId(e.target.value)}
                          className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition"
                          required
                        >
                          <option value="">Select Boundary</option>
                          {jurisdictions.map(j => (
                            <option key={j.id} value={j.id}>{j.name} ({j.tier})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Department Specialty (Nullable for general MPs/MLAs)</label>
                      <select 
                        value={offDepartmentId} onChange={(e) => setOffDepartmentId(e.target.value)}
                        className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition"
                      >
                        <option value="">Choose department sector (if applicable)</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Official uploader slots for ID Proof and Photo */}
                    <div className="border border-brand-border/60 bg-brand-dark/40 p-4 rounded-xl space-y-4">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-brand-border/40 pb-2">
                        <ShieldAlert size={14} className="text-brand-warning animate-pulse" /> Mandatory Official Verification Uploads
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Office ID Card */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Office ID Card Proof *</label>
                          <div className="flex flex-col gap-2 items-center border border-dashed border-brand-border/60 bg-brand-dark/35 p-3 rounded-lg">
                            {offIdProof ? (
                              <img src={offIdProof} alt="Office ID Proof" className="w-full h-20 object-cover rounded border border-brand-border" />
                            ) : (
                              <div className="h-20 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                                <Upload size={18} className="mb-1" />
                                No file uploaded
                              </div>
                            )}
                            <label className="w-full text-center py-1.5 bg-brand-card hover:bg-brand-border border border-brand-border text-[10px] font-bold rounded cursor-pointer transition">
                              Upload ID Card
                              <input type="file" accept="image/*" onChange={(e) => handleProofSelection(e, 'id')} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* Self Portrait */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Self Portrait Photo *</label>
                          <div className="flex flex-col gap-2 items-center border border-dashed border-brand-border/60 bg-brand-dark/35 p-3 rounded-lg">
                            {offPhotoProof ? (
                              <img src={offPhotoProof} alt="Self Portrait" className="w-full h-20 object-cover rounded border border-brand-border" />
                            ) : (
                              <div className="h-20 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                                <Camera size={18} className="mb-1" />
                                No photo snapped
                              </div>
                            )}
                            <label className="w-full text-center py-1.5 bg-brand-card hover:bg-brand-border border border-brand-border text-[10px] font-bold rounded cursor-pointer transition">
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
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-neon mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : registerRole === 'citizen' ? 'Create Citizen Profile' : 'Submit Verification Request'}
                </button>
              </form>

              {registerRole === 'citizen' && (
                <div className="mt-4 pt-4 border-t border-brand-border/40">
                  <button 
                    type="button" 
                    onClick={handleGoogleAuth}
                    className="w-full bg-slate-800 hover:bg-slate-755 border border-brand-border hover:border-brand-primary/50 text-white font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
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
          <div className="py-6 sm:py-10 max-w-md mx-auto">
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 sm:p-8 shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">Sign In to PublicEcho</h3>
              <p className="text-[11px] text-slate-400 text-center mb-6">Choose your access clearance level to authenticate</p>

              {/* Login toggle switcher (Three-tier) */}
              <div className="flex bg-brand-dark p-1 rounded-lg mb-6 border border-brand-border/80 text-[10px] sm:text-xs">
                <button 
                  type="button" onClick={() => setAuthRole('citizen')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition ${authRole === 'citizen' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Citizen
                </button>
                <button 
                  type="button" onClick={() => setAuthRole('official')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition ${authRole === 'official' ? 'bg-brand-secondary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Official
                </button>
                <button 
                  type="button" onClick={() => setAuthRole('admin')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition ${authRole === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Admin Desk
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={authRole === 'official' ? 'e.g. subhash.rao@bbmp.gov.in' : authRole === 'admin' ? 'megharajmaruthi@gmail.com' : 'e.g. john@gmail.com'}
                    className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                  <input 
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
                    required
                  />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-neon mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Authenticate Credentials'}
                </button>
              </form>

              {/* Google OAuth Login Button */}
              {authRole === 'citizen' && (
                <div className="mt-4 pt-4 border-t border-brand-border/40">
                  <button 
                    type="button" onClick={handleGoogleAuth}
                    className="w-full bg-slate-800 hover:bg-slate-750 border border-brand-border hover:border-brand-primary/50 text-white font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
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

        {/* ================= ADMIN APPROVALS PORTAL DASHBOARD ================= */}
        {view === 'admin-dash' && (
          <div className="py-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="text-indigo-400" /> Admin Command Center
                </h3>
                <p className="text-xs text-slate-400">Review official credentials, verify Office IDs and Portrait captures to approve new representatives.</p>
              </div>
              <button 
                onClick={fetchPendingOfficials}
                className="px-3 py-1.5 bg-brand-card border border-brand-border hover:border-brand-primary rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit"
              >
                <RefreshCw size={12} /> Sync Pending Requests
              </button>
            </div>

            <h4 className="font-bold text-slate-300 text-sm mb-4">Pending Official Registrations ({pendingOfficials.length})</h4>

            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <RefreshCw className="animate-spin inline mr-2" size={16} /> Retrieving onboarding audits...
              </div>
            ) : pendingOfficials.length === 0 ? (
              <div className="p-12 text-center bg-brand-card border border-dashed border-brand-border rounded-2xl text-slate-500 text-sm">
                <CheckCircle2 className="mx-auto mb-3 text-brand-accent" size={32} />
                No pending registrations! All official verification credentials have been audited.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {pendingOfficials.map((off) => (
                  <div key={off.id} className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl flex flex-col xl:flex-row gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>

                    {/* Official Details */}
                    <div className="xl:w-1/3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                            Pending Approval Audit
                          </span>
                          <h4 className="text-lg font-bold text-white mt-2">{off.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold">{off.email}</p>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300 pt-3 border-t border-brand-border/40">
                          <p><strong>Designation:</strong> {off.designation}</p>
                          <p><strong>Jurisdiction:</strong> {off.jurisdiction_name} ({off.jurisdiction_tier})</p>
                          {off.department_name && <p><strong>Department Sector:</strong> {off.department_name}</p>}
                          <p className="text-[10px] text-slate-500 pt-1">Request filed: {new Date(off.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex gap-2 mt-6 xl:mt-0">
                        <button 
                          onClick={() => handleAdminApproval(off.id, 'approve')}
                          className="flex-1 py-2 rounded-xl bg-brand-accent text-brand-dark font-bold text-xs hover:bg-brand-accent/80 transition flex items-center justify-center gap-1.5 shadow-neon-green"
                        >
                          <Check size={14} /> Approve Request
                        </button>
                        <button 
                          onClick={() => handleAdminApproval(off.id, 'reject')}
                          className="flex-1 py-2 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger font-bold text-xs hover:bg-brand-danger/20 transition flex items-center justify-center gap-1.5"
                        >
                          <X size={14} /> Reject Request
                        </button>
                      </div>
                    </div>

                    {/* Uploaded proofs comparison view */}
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Office ID Card */}
                      <div className="border border-brand-border/60 bg-brand-dark/40 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Office ID Card Proof</span>
                        <div className="w-full h-48 rounded-lg overflow-hidden border border-brand-border bg-brand-dark flex items-center justify-center">
                          {off.office_id_proof ? (
                            <img src={off.office_id_proof} alt="Office ID Proof" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-600 text-xs">No ID card uploaded.</span>
                          )}
                        </div>
                      </div>

                      {/* Self portrait */}
                      <div className="border border-brand-border/60 bg-brand-dark/40 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Self Portrait capture</span>
                        <div className="w-full h-48 rounded-lg overflow-hidden border border-brand-border bg-brand-dark flex items-center justify-center">
                          {off.photo_proof ? (
                            <img src={off.photo_proof} alt="Self Photo Proof" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-600 text-xs">No photo proof snapped.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= LEADERBOARD VIEW ================= */}
        {view === 'leaderboard' && (
          <div className="py-4 font-sans max-w-5xl mx-auto animate-slide-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Award className="text-brand-warning" /> Public Representative Leaderboard
                </h3>
                <p className="text-xs text-slate-400">Rankings based on multi-criteria citizen satisfaction feedback (Speed, Quality, and Communication).</p>
              </div>
              <button 
                onClick={fetchLeaderboard}
                className="px-3 py-1.5 bg-brand-card border border-brand-border hover:border-brand-primary rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Rankings
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <RefreshCw className="animate-spin inline mr-2" size={16} /> Compiling public feedback aggregates...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-12 text-center bg-brand-card border border-dashed border-brand-border rounded-2xl text-slate-500 text-sm">
                <ShieldAlert className="mx-auto mb-3 text-brand-warning" size={32} />
                No rated official datasets available. Ratings will populate as resolved issues are reviewed by citizens.
              </div>
            ) : (
              <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 bg-brand-dark/50 text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6 text-center">Rank</th>
                        <th className="py-4 px-6">Official Representative</th>
                        <th className="py-4 px-6">Jurisdiction Ward</th>
                        <th className="py-4 px-6 text-center">Cases Rated</th>
                        <th className="py-4 px-6 text-center">Speed Score</th>
                        <th className="py-4 px-6 text-center">Quality Score</th>
                        <th className="py-4 px-6 text-center">Comm. Score</th>
                        <th className="py-4 px-6 text-right pr-8">Composite Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40 text-xs sm:text-sm text-slate-300">
                      {leaderboard.map((item, idx) => {
                        const isTopThree = idx < 3;
                        const rankMedals = ['🥇 Gold', '🥈 Silver', '🥉 Bronze'];
                        return (
                          <tr key={item.official_id} className="hover:bg-brand-dark/45 transition-colors">
                            <td className="py-4 px-6 text-center font-bold">
                              {isTopThree ? (
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                  idx === 0 ? 'bg-amber-500/20 text-brand-warning border border-amber-500/30 shadow-neon-amber' :
                                  idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                                  'bg-amber-700/20 text-amber-600 border border-amber-700/30'
                                }`}>
                                  {rankMedals[idx]}
                                </span>
                              ) : (
                                <span className="text-slate-500">#{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <h5 className="font-bold text-white text-sm sm:text-base">{item.official_name}</h5>
                                <p className="text-[10px] text-slate-400 font-semibold">{item.designation}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-medium text-slate-400">{item.jurisdiction_name}</td>
                            <td className="py-4 px-6 text-center font-bold text-slate-200">{item.total_cases_rated}</td>
                            <td className="py-4 px-6 text-center font-semibold text-slate-400">{item.avg_speed_score} ⭐</td>
                            <td className="py-4 px-6 text-center font-semibold text-slate-400">{item.avg_quality_score} ⭐</td>
                            <td className="py-4 px-6 text-center font-semibold text-slate-400">{item.avg_communication_score} ⭐</td>
                            <td className="py-4 px-6 text-right pr-8">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-extrabold text-sm shadow-neon-green">
                                {item.composite_rating} / 5.0
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= CITIZEN DASHBOARD ================= */}
        {view === 'citizen-dash' && (
          <div className="space-y-8 animate-slide-in">
            {/* Citizen Welcome Banner */}
            <div className="bg-gradient-to-r from-brand-card via-brand-card to-brand-dark p-6 sm:p-8 rounded-2xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-primary"></div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">Welcome back, {user?.name}!</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Track your reported municipal issues, request recursive administrative escalations, and submit satisfaction feedback ratings once resolved.
                </p>
              </div>
              <button 
                onClick={() => { setShowFileModal(true); setNewLat('12.9304'); setNewLng('77.6784'); setNewAddress(''); }}
                className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-white font-bold text-sm shadow-neon transition flex items-center justify-center gap-2 w-fit shrink-0"
              >
                <PlusCircle size={16} /> File New Complaint
              </button>
            </div>

            {/* Quick Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Complaints Filed', 
                  val: grievances.length, 
                  color: 'text-brand-primary', 
                  bg: 'bg-brand-primary/10 border border-brand-primary/20' 
                },
                { 
                  label: 'Fully Resolved', 
                  val: grievances.filter(g => g.status === 'Resolved').length, 
                  color: 'text-brand-accent', 
                  bg: 'bg-brand-accent/10 border border-brand-accent/20' 
                },
                { 
                  label: 'Under Investigation', 
                  val: grievances.filter(g => g.status === 'In_Progress' || g.status === 'Assigned').length, 
                  color: 'text-brand-secondary', 
                  bg: 'bg-brand-secondary/10 border border-brand-secondary/20' 
                },
                { 
                  label: 'Escalated Actions', 
                  val: grievances.filter(g => g.status === 'Escalated').length, 
                  color: 'text-brand-danger', 
                  bg: 'bg-brand-danger/10 border border-brand-danger/20' 
                }
              ].map((metric, i) => (
                <div key={i} className={`p-4 rounded-xl flex flex-col justify-between ${metric.bg}`}>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{metric.label}</span>
                  <span className={`text-2xl sm:text-3xl font-extrabold mt-2 ${metric.color}`}>{metric.val}</span>
                </div>
              ))}
            </div>

            {/* Complaints list section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-extrabold text-slate-200 text-base flex items-center gap-2">
                  <Megaphone size={16} className="text-brand-primary" /> My Filed Grievances ({grievances.length})
                </h4>
                <button 
                  onClick={fetchCitizenGrievances}
                  className="px-2.5 py-1.5 bg-brand-card hover:bg-brand-border border border-brand-border rounded-lg text-xs text-slate-300 font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Sync Statuses
                </button>
              </div>

              {loading && grievances.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <RefreshCw className="animate-spin inline mr-2" size={16} /> Connecting to SQL database...
                </div>
              ) : grievances.length === 0 ? (
                <div className="p-12 text-center bg-brand-card border border-dashed border-brand-border rounded-2xl text-slate-500 text-sm">
                  <CheckCircle2 className="mx-auto mb-3 text-brand-accent" size={32} />
                  You haven't filed any municipal complaints! Click "File New Complaint" above to report a municipal breakdown.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grievances.map((g) => {
                    const overdue = isGrievanceOverdue(g);
                    return (
                      <div key={g.id} className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-brand-primary/45 transition duration-300">
                        {overdue && (
                          <div className="absolute top-0 right-0 left-0 h-1 bg-brand-danger animate-pulse rounded-t-2xl"></div>
                        )}
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ID: #{g.id}</span>
                            <div className="flex gap-2">
                              {overdue && (
                                <span className="px-2 py-0.5 rounded bg-brand-danger/20 border border-brand-danger/40 text-brand-danger text-[9px] font-extrabold flex items-center gap-1 animate-pulse">
                                  <AlertTriangle size={10} /> SLA OVERDUE
                                </span>
                              )}
                              {getStatusBadge(g.status)}
                            </div>
                          </div>

                          <h5 className="text-base font-bold text-white mb-1.5 leading-snug">{g.title}</h5>
                          <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{g.description}</p>
                          
                          {/* Landmark Address */}
                          <p className="text-xs text-slate-300 flex items-start gap-1.5 mb-4 bg-brand-dark/40 p-2 rounded-lg border border-brand-border/30">
                            <MapPin size={12} className="text-brand-primary mt-0.5 shrink-0" />
                            <span>{g.address}</span>
                          </p>

                          {/* Image preview slot if available */}
                          {g.image_url && (
                            <div className="w-full h-32 rounded-lg overflow-hidden border border-brand-border bg-brand-dark/50 mb-4 flex items-center justify-center">
                              <img src={g.image_url} alt="Evidence proof" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Info Rows */}
                          <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 py-3 border-t border-b border-brand-border/40 mb-4">
                            <div>
                              <span className="font-bold text-slate-500 block uppercase text-[9px]">Department Specialty</span>
                              <span className="text-slate-300 font-semibold">{g.department_name} ({g.SLA_days}d SLA)</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-500 block uppercase text-[9px]">Routing Jurisdiction</span>
                              <span className="text-slate-300 font-semibold">{g.jurisdiction_name} ({g.jurisdiction_tier})</span>
                            </div>
                          </div>

                          {/* Assigned official */}
                          <div className="mb-4">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Assigned Representative</span>
                            {g.assigned_official_name ? (
                              <div className="flex items-center gap-2 p-2 rounded bg-brand-dark/25 border border-brand-border/30">
                                <div className="w-6 h-6 rounded-full bg-brand-secondary/20 text-brand-secondary flex items-center justify-center font-bold text-[10px]">
                                  {g.assigned_official_name[0]}
                                </div>
                                <div className="leading-tight">
                                  <p className="text-xs font-bold text-slate-200">{g.assigned_official_name}</p>
                                  <p className="text-[9px] text-slate-400">{g.assigned_official_designation}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned (general queue)</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => viewTimeline(g)}
                            className="flex-grow py-2 bg-brand-card hover:bg-brand-border border border-brand-border text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Clock size={13} /> View Timeline Logs
                          </button>

                          {g.status !== 'Resolved' && g.status !== 'Escalated' && (
                            <button 
                              type="button"
                              onClick={() => handleEscalate(g.id)}
                              className="px-3.5 py-2 bg-brand-danger/10 border border-brand-danger/20 hover:bg-brand-danger/25 text-brand-danger rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                              title="Escalate to superior boundary representative"
                            >
                              <ShieldAlert size={13} /> Escalate
                            </button>
                          )}

                          {g.status === 'Resolved' && (
                            <button 
                              type="button"
                              onClick={() => setSelectedFeedbackGrievance(g)}
                              className="flex-grow py-2 bg-brand-accent text-brand-dark hover:bg-brand-accent/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-neon-green"
                            >
                              <Star size={13} /> Rate Resolution
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= OFFICIAL DASHBOARD ================= */}
        {view === 'official-dash' && (
          <div className="space-y-8 animate-slide-in">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-brand-card via-brand-card to-brand-dark p-6 sm:p-8 rounded-2xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-secondary"></div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase bg-brand-secondary/20 text-brand-secondary px-2 py-0.5 rounded">
                  Official Administrative Desk
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">{user?.name}</h3>
                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Briefcase size={12} className="text-brand-secondary shrink-0" /> {user?.designation} • {user?.jurisdiction_name} ({user?.jurisdiction_tier})
                  {user?.department_name && ` • ${user?.department_name}`}
                </p>
              </div>
              <button 
                onClick={fetchOfficialGrievances}
                className="px-4 py-2.5 bg-brand-card hover:bg-brand-border border border-brand-border hover:border-brand-secondary rounded-xl text-xs text-slate-300 font-bold flex items-center gap-1.5 transition w-fit"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh My Desk
              </button>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Pending Assignment', 
                  val: officialStats?.pending_count || 0, 
                  color: 'text-brand-warning', 
                  bg: 'bg-brand-warning/10 border border-brand-warning/20' 
                },
                { 
                  label: 'Active Cases', 
                  val: officialStats?.active_count || 0, 
                  color: 'text-indigo-400', 
                  bg: 'bg-indigo-950/20 border border-indigo-800/25' 
                },
                { 
                  label: 'Escalated Suffixes', 
                  val: officialStats?.escalated_count || 0, 
                  color: 'text-brand-danger', 
                  bg: 'bg-brand-danger/10 border border-brand-danger/20' 
                },
                { 
                  label: 'Total Cases Assigned', 
                  val: officialStats?.total_count || 0, 
                  color: 'text-slate-200', 
                  bg: 'bg-slate-800/20 border border-slate-700/25' 
                }
              ].map((m, i) => (
                <div key={i} className={`p-4 rounded-xl flex flex-col justify-between ${m.bg}`}>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{m.label}</span>
                  <span className={`text-2xl sm:text-3xl font-extrabold mt-2 ${m.color}`}>{m.val}</span>
                </div>
              ))}
            </div>

            {/* Works List */}
            <div>
              <h4 className="font-extrabold text-slate-200 text-base mb-6 flex items-center gap-2">
                <Clock size={16} className="text-brand-secondary" /> Active Work Items Queue ({grievances.length})
              </h4>

              {loading && grievances.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <RefreshCw className="animate-spin inline mr-2" size={16} /> Retrieving municipal grievances...
                </div>
              ) : grievances.length === 0 ? (
                <div className="p-12 text-center bg-brand-card border border-dashed border-brand-border rounded-2xl text-slate-500 text-sm">
                  <CheckCircle2 className="mx-auto mb-3 text-brand-accent" size={32} />
                  Congratulations! All assigned municipal cases under your boundary have been fully resolved!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grievances.map((g) => {
                    const overdue = isGrievanceOverdue(g);
                    return (
                      <div key={g.id} className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-brand-secondary/45 transition duration-300">
                        {overdue && (
                          <div className="absolute top-0 right-0 left-0 h-1 bg-brand-danger animate-pulse rounded-t-2xl"></div>
                        )}
                        <div>
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
                              <span className="text-slate-300 font-semibold">{g.department_name} ({g.SLA_days}d SLA)</span>
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
                              <p className="text-slate-400 mt-1 flex items-center gap-1.5 font-mono text-[10px]">
                                📞 {g.citizen_phone || 'Google Linked'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => viewTimeline(g)}
                            className="flex-grow py-2 bg-brand-card hover:bg-brand-border border border-brand-border text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Clock size={13} /> View Timeline Logs
                          </button>

                          {(g.status === 'Reported' || g.status === 'Assigned') && (
                            <button 
                              type="button"
                              onClick={() => handleStatusUpdate(g.id, 'In_Progress')}
                              className="flex-grow py-2 bg-brand-secondary hover:bg-brand-secondary/85 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-neon"
                            >
                              <RefreshCw size={13} className="animate-spin" /> Initiate Investigation
                            </button>
                          )}

                          {g.status === 'In_Progress' && (
                            <button 
                              type="button"
                              onClick={() => setShowResolveModal(g)}
                              className="flex-grow py-2 bg-brand-accent text-brand-dark hover:bg-brand-accent/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-neon-green"
                            >
                              <CheckCircle2 size={13} /> Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODALS & TIMELINE HISTORY OVERLAYS
         ========================================================================= */}



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
                type="submit" disabled={loading}
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold py-2 rounded-lg text-xs transition shadow-neon flex items-center justify-center gap-1.5"
              >
                {loading ? 'Authenticating...' : 'Submit Verification Key'}
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
                      <option key={d.id} value={d.id}>{d.name} ({d.SLA_days}d SLA)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Administrative presets (Testing)</label>
                  <select 
                    onChange={(e) => applyCoordinatePreset(e.target.value)}
                    className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition"
                  >
                    <option value="">Choose preset coords...</option>
                    <option value="bellandur">Ward 150 - Bellandur Presets</option>
                    <option value="hsr">Ward 174 - HSR Layout Presets</option>
                  </select>
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

      {/* MODAL 5: RESOLVE NOTE COMPONENT */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-accent"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-brand-border/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="text-brand-accent" /> Resolve Complaint
              </h3>
              <button onClick={() => setShowResolveModal(null)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide comprehensive notes explaining the works completed. This will be stored inside the database audit logs.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Summary Note *</label>
                <textarea 
                  rows="4"
                  value={resolutionNotes} 
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Inspected the line. Cleared debris blockage and verified water flow pressure tests..."
                  className="w-full bg-brand-dark/60 border border-brand-border rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent transition"
                  required
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-brand-border/60 flex items-center justify-end gap-3">
              <button 
                onClick={() => { setShowResolveModal(null); setResolutionNotes(''); }}
                className="px-4 py-2 border border-brand-border text-slate-300 hover:text-white rounded-xl text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusUpdate(showResolveModal.id, 'Resolved')}
                className="px-5 py-2 bg-brand-accent text-brand-dark font-bold rounded-xl text-sm shadow-neon-green"
              >
                Confirm Resolved
              </button>
            </div>
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
                    <span className="text-brand-warning">{ratingSpeed} / 5 ⭐</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={ratingSpeed} 
                    onChange={(e) => setRatingSpeed(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>2. Quality of Work</span>
                    <span className="text-brand-warning">{ratingQuality} / 5 ⭐</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={ratingQuality} 
                    onChange={(e) => setRatingQuality(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>3. Official Communication</span>
                    <span className="text-brand-warning">{ratingComm} / 5 ⭐</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={ratingComm} 
                    onChange={(e) => setRatingComm(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
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
      <footer className="border-t border-brand-border/60 bg-brand-dark/90 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] sm:text-xs text-slate-500">
          <p>© 2026 PublicEcho. Designed with cyber dark glassmorphism templates. Admin approvals, domain audits, and MFA verifications active.</p>
        </div>
      </footer>
    </div>
  );
}

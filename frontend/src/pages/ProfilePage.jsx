// // src/pages/ProfilePage.jsx
// import React, { useState, useRef } from 'react';
// import { useAuth } from '../hooks/useAuth.jsx'; // Use auth context
// import ProgressBar from '../components/UI/ProgressBar.jsx';
// import { getBadgeDetails } from '../config/badges';
// import Modal from '../components/UI/Modal.jsx'; // Reuse modal
// import { updateProfilePicture } from '../services/api.js'; // Import API function
// import { toast } from 'react-toastify'; // For notifications
// import './ProfilePage.css'; // Ensure CSS is imported
// import { Link } from 'react-router-dom';

// // --- calculateXpForNextLevel function (Keep as is) ---
// const calculateXpForNextLevel = (level) => {
//     return level * 100;
// };

// // --- BadgeItem Component (Keep as is) ---
// const BadgeItem = ({ badgeIdentifier, onClick }) => { // <-- Make sure 'onClick' is received here
//   const { name, icon, description } = getBadgeDetails(badgeIdentifier);
//   return (
//       // The onClick listener should be on the interactive element, the <li>
//       <li className="badge-item" title={description} onClick={() => onClick(badgeIdentifier)}>
//           <span className="badge-icon">{icon}</span>
//           <span className="badge-name">{name}</span>
//       </li>
//   );
// };

// // --- !! Get Backend URL Base !! ---
// // Use the same env variable as your API calls
// const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
// // Removes '/api' part to get base URL like http://localhost:5001


// // --- ProfilePage Component ---
// const ProfilePage = () => {
//   const { user, loading } = useAuth();
//   // --- Modal State ---
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedBadge, setSelectedBadge] = useState(null); // Stores identifier of selected badge
//   // --- End Modal State ---

//   // --- !! NEW: Profile Picture Edit Modal State !! ---
//   const [previewSource, setPreviewSource] = useState('');
//   const [isEditPicModalOpen, setIsEditPicModalOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [newProfilePicUrl, setNewProfilePicUrl] = useState('');
//   const [isUpdatingPic, setIsUpdatingPic] = useState(false);
//   const [picUpdateError, setPicUpdateError] = useState('');
//   const fileInputRef = useRef(null);
//   const openBadgeModal = (badgeIdentifier) => {
//     console.log("Opening modal for badge:", badgeIdentifier); // <-- Add log to check if handler is called
//     setSelectedBadge(badgeIdentifier);
//     setIsModalOpen(true);
//   };
//   const closeBadgeModal = () => {
//     console.log("Closing modal"); // <-- Add log
//     setIsModalOpen(false);
//     setSelectedBadge(null); // Clear selection on close
//   };
//    const openEditPicModal = () => {
//     setPicUpdateError('');
//     setSelectedFile(null); // Clear previous file selection
//     setPreviewSource(''); // Clear previous preview
//     if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//     }
//     setIsEditPicModalOpen(true);
// };
// const closeEditPicModal = () => {
//     setIsEditPicModalOpen(false);
//     setPicUpdateError('');
//     setSelectedFile(null); // Clear selection on close
//     setPreviewSource(''); // Clear preview on close
//     if (fileInputRef.current) { // Also reset input visually on cancel
//         fileInputRef.current.value = "";
//     }
// };
//  const handleFileChange = (e) => {
//   const file = e.target.files[0];
//   if (file) {
//       // --- Validation Logic ---
//        if (!['image/jpeg', 'image/png', 'image/gif','image/jpg'].includes(file.type) || file.size > 5 * 1024 * 1024) {
//            setPicUpdateError('Invalid file (Must be JPG/PNG/GIF, max 5MB)');
//            setSelectedFile(null); setPreviewSource(''); e.target.value = ""; return;
//        }
//        setPicUpdateError(''); // <-- Make sure this line is here!]

//        setSelectedFile(file);
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onloadend = () => { setPreviewSource(reader.result); };
//   } else {
//        // No file selected (e.g., user cancelled)
//        setSelectedFile(null);
//        setPreviewSource('');
//        // Optionally clear error here too if needed: setPicUpdateError('');
//   }
// };
// const handleProfilePicUpdate = async (e) => {
//   e.preventDefault();
//   if (!selectedFile) {
//       setPicUpdateError('Please select an image file to upload.');
//       return;
//   }
//   setIsUpdatingPic(true);
//   setPicUpdateError('');
//   const formData = new FormData();
//   console.log("Value of selectedFile JUST BEFORE append:", selectedFile); // Add this
//   formData.append('profilePicture', selectedFile);
//   try {
//       console.log("Uploading profile picture file...");
//       const response = await updateProfilePicture(formData); // Send FormData
//       console.log("Update pic response:", response.data);
//       updateUserState({ profilePictureUrl: response.data.profilePictureUrl });

//       toast.success("Profile picture updated!");
//       closeEditPicModal(); // Close modal on success

//   } catch (err) {
//       console.error("Error uploading profile picture:", err);
//       const errorMsg = err.response?.data?.message || "Failed to upload picture.";
//       setPicUpdateError(errorMsg);
//       toast.error(`Upload Error: ${errorMsg}`);
//   } finally {
//       setIsUpdatingPic(false);
//   }
// };
//   if (loading) { return <div className="loading-app">Loading Profile...</div>; }
//   if (!user) {
//     return (
//       <div className="profile-container error-state">
//           <h2>Error</h2>
//           <p>Could not load user profile data. Please try logging in again.</p>
//           <Link to="/login">Go to Login</Link>
//       </div>
//     );
//   }
//   const xpRequiredForNextLevel = calculateXpForNextLevel(user.level);
//   const xpBaseForCurrentLevel = (user.level - 1) * 100;
//   const xpInCurrentLevel = user.xp - xpBaseForCurrentLevel;
//   const xpSpanForCurrentLevel = Math.max(1, xpRequiredForNextLevel - xpBaseForCurrentLevel);
//   const earnedBadges = user.achievements
//       ? user.achievements.filter(ach => ach.startsWith('badge_')) // Filter by prefix
//       : [];
// const selectedBadgeDetails = selectedBadge ? getBadgeDetails(selectedBadge) : null;
//  const getFullImageUrl = (relativePath) => {
//   if (!relativePath) return '/images/avatars/default_avatar.png'; // Frontend default
//   if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) return relativePath;
//   if (relativePath.startsWith('/images')) return relativePath; // Other frontend public paths
//   // Prepend backend URL for paths stored from backend uploads (e.g., /uploads/...)
//   return `${BACKEND_URL}${relativePath}`;
// };
//   const displayImageUrl = (isEditPicModalOpen && previewSource)
//        ? previewSource
//        : getFullImageUrl(user.profilePictureUrl);
//   // ----------------------------------

//   return (
//     <div className="profile-container">
//       {/* --- Profile Header with Picture --- */}
//       <header className="profile-header">
//                 <div className="profile-picture-container">
//                     <img
//                         src={displayImageUrl} // <-- Use the constructed full URL
//                         alt={`${user.username}'s profile`}
//                         className="profile-picture"
//                         onError={(e) => {
//                             console.warn(`Failed loading profile pic: ${e.target.src}. Using default.`);
//                             e.target.src = '/images/avatars/default_avatar.png'; // Default path served by frontend
//                             e.target.onerror = null;
//                         }}
//                      />
//           <button onClick={openEditPicModal} className="edit-picture-button" title="Edit profile picture">
//             ✏️
//           </button>
//         </div>
//         <h1>{user.username}'s Profile</h1>
//         <p className="profile-email">{user.email}</p>
//       </header>
//       <section className="profile-stats-section card">
//          {/* ... stats grid, xp progress bar ... */}
//          <h2>Stats & Progress</h2>
//           <div className="stats-grid">
//               <div className="stat-item">
//                   <span className="stat-label">Level</span>
//                   <span className="stat-value level-badge-profile">{user.level}</span>
//               </div>
//                <div className="stat-item">
//                   <span className="stat-label">Total XP</span>
//                   <span className="stat-value">{user.xp}</span>
//               </div>
//           </div>
//           <div className="xp-progress">
//               <ProgressBar
//                   value={xpInCurrentLevel}
//                   max={xpSpanForCurrentLevel}
//                   label={`XP to Level ${user.level + 1}`}
//               />
//               <span className="xp-details">
//                   {xpInCurrentLevel} / {xpSpanForCurrentLevel} XP towards next level
//               </span>
//           </div>
//       </section>
//        <section className="profile-badges-section card">
//         <h2>🏆 Badges Earned</h2>
//         {earnedBadges.length > 0 ? (
//           <ul className="badges-list-profile">
//             {earnedBadges.map((badgeIdentifier) => (
//                <BadgeItem
//                  key={badgeIdentifier}
//                  badgeIdentifier={badgeIdentifier}
//                  // Ensure the openBadgeModal function is passed correctly as the onClick prop
//                  onClick={openBadgeModal} // <-- This seems correct
//                />
//             ))}
//           </ul>
//         ) : (
//           <p className="no-achievements">No badges earned yet.</p>
//         )}
//       </section>
//       <div className="profile-actions">
//           <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
//       </div>
//       <Modal isOpen={isModalOpen} onClose={closeBadgeModal}>
//         {selectedBadgeDetails && ( // Only render content if details exist
//            <div className="badge-modal-content">
//               <img
//                  src={selectedBadgeDetails.imageUrl}
//                  alt={`${selectedBadgeDetails.name} Badge`}
//                  className="badge-modal-image"
//                  onError={(e) => {
//                   console.error(`Failed to load image: ${e.target.src}`); // Log error
//                   e.target.src = '/images/badges/default_badge.png'; // Ensure default exists
//                   e.target.onerror = null; // Prevent infinite loop if default also fails
//                 }} // Fallback image on error
//               />
//               <h3 className="badge-modal-title">
//                  {selectedBadgeDetails.icon} {selectedBadgeDetails.name}
//               </h3>
//               <p className="badge-modal-description">{selectedBadgeDetails.description}</p>
//               <p className="badge-modal-message">{selectedBadgeDetails.message}</p>
//            </div>
//         )}
//       </Modal>
//       <Modal isOpen={isEditPicModalOpen} onClose={closeEditPicModal}>
//          <div className="edit-picture-modal-content">
//             <h2>Update Profile Picture</h2>
//             {previewSource && (
//                 <img src={previewSource} alt="Preview" className="image-preview"/>
//             )}
//             {picUpdateError && <p className="error-message">{picUpdateError}</p>}
//             <form onSubmit={handleProfilePicUpdate}>
//                 <div className="form-group">
//                     <label htmlFor="profilePicFile" className="file-input-label">
//                         {selectedFile ? selectedFile.name : "Choose Image File..."}
//                     </label>
//                     <input
//                         type="file"
//                         id="profilePicFile"
//                         accept="image/png, image/jpeg, image/gif"
//                         onChange={handleFileChange} // Use file change handler
//                         ref={fileInputRef}
//                         style={{ display: 'none' }} // Hide the default input
//                         disabled={isUpdatingPic}
//                     />
//                     <small>Max file size: 5MB. Allowed types: JPG, PNG, GIF.</small>
//                 </div>
//                 <button type="submit" className="submit-button" disabled={isUpdatingPic || !selectedFile}>
//                     {isUpdatingPic ? 'Uploading...' : 'Upload & Save'}
//                 </button>
//             </form>
//          </div>
//       </Modal>
//     </div>
//   );
// };

// export default ProfilePage;

// src/pages/ProfilePage.jsx
import React, { useState, useRef } from 'react'; // Ensure useRef is imported
import { useAuth } from '../hooks/useAuth.jsx'; // Use auth context
import ProgressBar from '../components/UI/ProgressBar.jsx';
import { getBadgeDetails } from '../config/badges';
import Modal from '../components/UI/Modal.jsx'; // Reuse modal
import { updateProfilePicture } from '../services/api.js'; // API function should handle FormData
import { toast } from 'react-toastify'; // For notifications
import './ProfilePage.css'; // Ensure CSS is imported
import { Link } from 'react-router-dom';

// --- calculateXpForNextLevel function ---
const calculateXpForNextLevel = (level) => {
    return level * 100;
};

// --- BadgeItem Component ---
const BadgeItem = ({ badgeIdentifier, onClick }) => {
  const { name, icon, description } = getBadgeDetails(badgeIdentifier);
  return (
      <li className="badge-item" title={description} onClick={() => onClick(badgeIdentifier)}>
          <span className="badge-icon">{icon}</span>
          <span className="badge-name">{name}</span>
      </li>
  );
};

// --- Get Backend URL Base ---
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// --- ProfilePage Component ---
const ProfilePage = () => {
  const { user, loading, updateUserState } = useAuth(); // Get updateUserState

  // --- Modal State ---
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  // --- Profile Picture Edit Modal State ---
  const [isEditPicModalOpen, setIsEditPicModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // State for the selected File object
  const [previewSource, setPreviewSource] = useState(''); // State for image preview Data URL
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const [picUpdateError, setPicUpdateError] = useState('');
  const fileInputRef = useRef(null); // Ref for the file input element
  // --- End State ---

  // --- Modal Handlers (Badge) ---
  const openBadgeModal = (badgeIdentifier) => {
    console.log("Opening badge modal for:", badgeIdentifier);
    setSelectedBadge(badgeIdentifier);
    setIsBadgeModalOpen(true);
  };
  const closeBadgeModal = () => {
    console.log("Closing badge modal");
    setIsBadgeModalOpen(false);
    setSelectedBadge(null);
  };

  // --- Profile Picture Modal Handlers (File Upload Version) ---
  const openEditPicModal = () => {
    setPicUpdateError('');
    setSelectedFile(null); // Clear file
    setPreviewSource(''); // Clear preview
    if (fileInputRef.current) { fileInputRef.current.value = ""; } // Reset input visually
    setIsEditPicModalOpen(true);
  };

  const closeEditPicModal = () => {
    setIsEditPicModalOpen(false);
    setPicUpdateError('');
    setSelectedFile(null);
    setPreviewSource('');
    if (fileInputRef.current) { fileInputRef.current.value = ""; } // Reset input visually
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validation
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            setPicUpdateError('Invalid file (Must be JPG/PNG/GIF, max 5MB)');
            setSelectedFile(null); setPreviewSource(''); e.target.value = ""; return;
        }
        setPicUpdateError(''); // Clear error on valid selection
        setSelectedFile(file);
        // Generate Preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => { setPreviewSource(reader.result); };
    } else {
        setSelectedFile(null); setPreviewSource('');
    }
  };

  const handleProfilePicUpdate = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        setPicUpdateError('Please select an image file to upload.');
        return;
    }
    setIsUpdatingPic(true);
    setPicUpdateError('');

    // Create FormData
    const formData = new FormData();
    formData.append('profilePicture', selectedFile); // Key must match backend
    console.log("Frontend: Appending file to FormData:", selectedFile); // Log check
    console.log(`Frontend: Checking FormData entry for 'profilePicture':`, formData.get('profilePicture'));

    try {
        console.log("Frontend: Calling updateProfilePicture API...");
        const response = await updateProfilePicture(formData); // Send FormData
        console.log("Update pic response:", response.data);

        // Update user state in AuthContext
        updateUserState({ profilePictureUrl: response.data.profilePictureUrl });

        toast.success("Profile picture updated!");
        closeEditPicModal(); // Close modal on success
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        const errorMsg = err.response?.data?.message || "Failed to upload picture.";
        setPicUpdateError(errorMsg);
        toast.error(`Upload Error: ${errorMsg}`);
    } finally {
        setIsUpdatingPic(false);
    }
  };
  // --- End Handlers ---


  // --- Loading/Error Checks ---
  if (loading) { return <div className="loading-app">Loading Profile...</div>; }
  if (!user) {
    return ( <div className="profile-container error-state"> {/* ... error display ... */} </div> );
  }

  // ... XP Calculation ...
  const xpRequiredForNextLevel = calculateXpForNextLevel(user.level);
  const xpBaseForCurrentLevel = (user.level - 1) * 100;
  const xpInCurrentLevel = user.xp - xpBaseForCurrentLevel;
  const xpSpanForCurrentLevel = Math.max(1, xpRequiredForNextLevel - xpBaseForCurrentLevel);

  // Filter Badges
  const earnedBadges = user.achievements?.filter(ach => ach.startsWith('badge_')) || [];
  const selectedBadgeDetails = selectedBadge ? getBadgeDetails(selectedBadge) : null;

  // Image URL Logic
  const getFullImageUrl = (relativePath) => {
    console.log("getFullImageUrl called with:", relativePath); // <-- Log input
    if (!relativePath) {
        console.log(" -> Path empty, returning default.");
        return '/images/avatars/default_avatar.png'; // Path to frontend default
    }
    if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) {
         console.log(" -> Path is already full URL:", relativePath);
        return relativePath;
    }
    // Check if it's the default avatar path itself
    if (relativePath === '/images/avatars/default_avatar.png') {
        console.log(" -> Path is the default avatar path.");
        return relativePath;
    }
    // Assume it's a path relative to backend uploads
    const fullUrl = `${BACKEND_URL}${relativePath}`;
    console.log(" -> Prepending backend URL, returning:", fullUrl);
    return fullUrl;
};
  // Use preview ONLY if modal is open, otherwise use stored user URL
  const displayImageUrl = (isEditPicModalOpen && previewSource)
       ? previewSource
       : getFullImageUrl(user.profilePictureUrl);
  // --- End Data Prep ---


  // --- Render Component ---
  return (
    <div className="profile-container">
      {/* --- Profile Header --- */}
      <header className="profile-header">
         <div className="profile-picture-container">
           <img
             src={displayImageUrl} // <-- Use dynamic URL
             alt={`${user.username}'s profile`}
             className="profile-picture"
             onError={(e) => {
                 console.warn(`Failed loading profile pic: ${e.target.src}. Using default.`);
                 e.target.src = '/images/avatars/default_avatar.png';
                 e.target.onerror = null;
             }}
           />
           <button onClick={openEditPicModal} className="edit-picture-button" title="Edit profile picture"> ✏️ </button>
         </div>
         <h1>{user.username}'s Profile</h1>
         <p className="profile-email">{user.email}</p>
       </header>
       {/* --- End Header --- */}

       {/* --- Sections (Stats, Badges, Actions) --- */}
        <section className="profile-stats-section card">
          <h2>Stats & Progress</h2>
          <div className="stats-grid">
              <div className="stat-item"><span className="stat-label">Level</span><span className="stat-value level-badge-profile">{user.level}</span></div>
              <div className="stat-item"><span className="stat-label">Total XP</span><span className="stat-value">{user.xp}</span></div>
          </div>
          <div className="xp-progress">
              <ProgressBar value={xpInCurrentLevel} max={xpSpanForCurrentLevel} label={`XP to Level ${user.level + 1}`} />
              <span className="xp-details">{xpInCurrentLevel} / {xpSpanForCurrentLevel} XP towards next level</span>
          </div>
        </section>
        <section className="profile-badges-section card">
          <h2>🏆 Badges Earned</h2>
          {earnedBadges.length > 0 ? (
            <ul className="badges-list-profile">
              {earnedBadges.map((badgeIdentifier) => ( <BadgeItem key={badgeIdentifier} badgeIdentifier={badgeIdentifier} onClick={openBadgeModal} /> ))}
            </ul>
          ) : ( <p className="no-achievements">No badges earned yet.</p> )}
        </section>
        <div className="profile-actions"> <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link> </div>
       {/* --- End Sections --- */}


       {/* --- Modals --- */}
       {/* Badge Detail Modal */}
       <Modal isOpen={isBadgeModalOpen} onClose={closeBadgeModal}>
         {selectedBadgeDetails && (
            <div className="badge-modal-content">
                <img src={selectedBadgeDetails.imageUrl} alt={`${selectedBadgeDetails.name} Badge`} className="badge-modal-image" onError={(e) => { e.target.src = '/images/badges/default_badge.png'; e.target.onerror = null; }} />
                <h3 className="badge-modal-title">{selectedBadgeDetails.icon} {selectedBadgeDetails.name}</h3>
                <p className="badge-modal-description">{selectedBadgeDetails.description}</p>
                <p className="badge-modal-message">{selectedBadgeDetails.message}</p>
            </div>
         )}
       </Modal>

       {/* Edit Profile Picture Modal (File Upload Version) */}
       <Modal isOpen={isEditPicModalOpen} onClose={closeEditPicModal}>
         <div className="edit-picture-modal-content">
            <h2>Update Profile Picture</h2>
            {previewSource && ( <img src={previewSource} alt="Preview" className="image-preview"/> )}
            {picUpdateError && <p className="error-message">{picUpdateError}</p>}
            <form onSubmit={handleProfilePicUpdate}>
                <div className="form-group">
                    <label htmlFor="profilePicFile" className="file-input-label">
                        {selectedFile ? selectedFile.name : "Choose Image File..."}
                    </label>
                    <input type="file" id="profilePicFile" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} disabled={isUpdatingPic} />
                    <small>Max file size: 5MB. Allowed types: JPG, PNG, GIF.</small>
                </div>
                <button type="submit" className="submit-button" disabled={isUpdatingPic || !selectedFile}>
                    {isUpdatingPic ? 'Uploading...' : 'Upload & Save'}
                </button>
            </form>
         </div>
      </Modal>
      {/* --- End Modals --- */}

    </div> // End profile-container
  );
};

export default ProfilePage;
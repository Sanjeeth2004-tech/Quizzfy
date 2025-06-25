import { useState, useEffect } from 'react';
import '../styles/Settings.css';

function Settings() {
  const savedImage = localStorage.getItem('profileImage');
  const defaultImage = '/rajpro.jpg'; // from public folder
  const [profileImage, setProfileImage] = useState(savedImage || defaultImage);
  const [imageChosen, setImageChosen] = useState(!!savedImage);
  const [soundEffects, setSoundEffects] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (profileImage && profileImage !== defaultImage) {
      localStorage.setItem('profileImage', profileImage);
    }
  }, [profileImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setImageChosen(true);
        localStorage.setItem('profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>

      <div className="setting-section">
        <h3>Account</h3>

        <div className="setting profile-picture-setting">
          <div className="profile-text">
            <label>Profile Picture</label>
            <p>Change your profile photo</p>
          </div>
          <div className="profile-image-container-vertical">
            <img
              src={profileImage}
              alt="Profile"
              className="profile-image-large"
            />
            <label htmlFor="file-upload" className="upload-button-custom">
              {imageChosen ? 'Change' : 'Choose Photo'}
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="upload-button-hidden"
            />
          </div>
        </div>

        <div className="setting">
          <div>
            <label>Profile Information</label>
            <p>Edit your personal information</p>
          </div>
          <button>Edit</button>
        </div>

        <div className="setting">
          <div>
            <label>Password</label>
            <p>Change your password</p>
          </div>
          <button>Change</button>
        </div>
      </div>

      <div className="setting-section">
        <h3>Notifications</h3>
        <div className="setting">
          <div>
            <label>Push Notifications</label>
            <p>Receive reminders about quizzes</p>
          </div>
          <div className="toggle">
            <input
              type="checkbox"
              id="push-notifications"
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
            />
            <label htmlFor="push-notifications" className="toggle-label" />
          </div>
        </div>
      </div>

      <div className="setting-section">
        <h3>Preferences</h3>

        <div className="setting">
          <div>
            <label>Sound Effects</label>
            <p>Enable/disable quiz sounds</p>
          </div>
          <div className="toggle">
            <input
              type="checkbox"
              id="sound-effects"
              checked={soundEffects}
              onChange={() => setSoundEffects(!soundEffects)}
            />
            <label htmlFor="sound-effects" className="toggle-label" />
          </div>
        </div>

        <div className="setting">
          <div>
            <label>Language</label>
            <p>Set your preferred language</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
      </div>

      <div className="setting-section">
        <h3>Privacy</h3>
        <div className="setting">
          <div>
            <label>Privacy Policy</label>
            <p>Read our privacy policy</p>
          </div>
          <button>View</button>
        </div>
        <div className="setting">
          <div>
            <label>Terms of Service</label>
            <p>Read our terms of service</p>
          </div>
          <button>View</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;

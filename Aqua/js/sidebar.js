class SidebarComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const username = localStorage.getItem('username') || 'User';
    const profilePicture = localStorage.getItem('profilePicture') || '../images/person.png';
    shadow.innerHTML = `
      <style>
        :host {
          /* Component container styles */
          display: block;
          --sidebar-width: 250px;
          --sidebar-collapsed-width: 80px;
          --primary-color: #4a6fa5;
          --secondary-color: #f8f9fa;
          --text-color: #333;
          --transition-speed: 0.3s;         
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
          transition: width var(--transition-speed);
        }
        
        .sidebar {
          width: 100%;
          height: 100%;
          background: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        /* Toggle Button - completely visible now */
        .toggle-btn {
          position: absolute;
          right: -20px; /* Moved further out to be fully visible */
          top: 20px;
          width: 40px;
          height: 40px;
          background: white;
          border: none;
          border-radius: 50%;
          box-shadow: 0 0 5px rgba(0,0,0,0.2);
          cursor: pointer;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--primary-color);
          transition: all var(--transition-speed);
        }
        
        /* Sidebar Content - no scrollbar */
        .sidebar-content {
          padding: 20px 15px;
          display: flex;
          flex-direction: column;
          height: calc(100% - 40px); /* Account for padding */
        
        }
        
        /* Company Logo */
        .company {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
          transition: all var(--transition-speed);
        }
        
        .company img {
          width: 40px;
          height: auto;
          transition: all var(--transition-speed);
        }
        
        .company-name {
          margin-left: 10px;
          font-weight: 600;
          white-space: nowrap;
          transition: opacity var(--transition-speed);
        }
        
        /* User Profile - centered */
        .user-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
          padding: 0 10px;
          transition: all var(--transition-speed);
          overflow: hidden; /* Prevent any overflow */
        }
        
        .user-profile img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
          transition: all var(--transition-speed);
        }
        
        .user-profile h2 {
          font-size: 16px;
          margin: 5px 0;
          white-space: nowrap;
          transition: all var(--transition-speed);
          text-align: center;
          width: 100%;
        }
        
        .badge {
          display: inline-block;
          padding: 3px 8px;
          background: var(--primary-color);
          color: white;
          border-radius: 10px;
          font-size: 12px;
          margin-top: 5px;
        }
        
        /* Navigation - with proper spacing */
        nav {
          flex: 1; /* Take remaining space */
        }
        
        nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .nav-item {
          margin-bottom: 10px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          border-radius: 5px;
          color: var(--text-color);
          text-decoration: none;
          transition: all var(--transition-speed);
          position: relative;
        }
        
        .icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .nav-text {
          white-space: nowrap;
          transition: opacity var(--transition-speed);
        }
        
        /* Logout Button */
        .bottom-section {
          margin-top: auto;
          padding: 15px 0 5px;
          border-top: 1px solid rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .logout {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-color);
          color: white !important;
          border: none;
          border-radius: 5px;
          padding: 8px 16px;
          cursor: pointer;
          text-decoration: none !important;
          transition: all var(--transition-speed);
          max-width: 90%;
        }
        
        .logout-link {
          color: inherit;
          text-decoration: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        .logout-icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }
        
        .logout-text {
          white-space: nowrap;
          transition: opacity var(--transition-speed);
          color: white !important;
        }
        
        /* Tooltip */
        .tooltip {
          position: absolute;
          left: 50px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--primary-color);
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 100;
          pointer-events: none;
          
        }
        
        .tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: transparent var(--primary-color) transparent transparent;
        }
        
        /* Collapsed State */
        :host(.collapsed) {
          width: var(--sidebar-collapsed-width);
        }
          :host(.collapsed) .tooltip {
display: none;
}

:host(.collapsed) .nav-link:hover .tooltip {
display: block;
}
:host(:not(.collapsed)) .tooltip {
display: none !important;
}
        
        :host(.collapsed) .company {
          justify-content: center;
          padding: 0 5px;
        }
        
        :host(.collapsed) .company-name,
        :host(.collapsed) .nav-text,
        :host(.collapsed) .user-profile h2,
        :host(.collapsed) .logout-text {
          opacity: 0;
          width: 0;
          height: 0;
          overflow: hidden;
          display: inline-block;
        }
        
        :host(.collapsed) .user-profile img {
          width: 40px;
          height: 40px;
        }
        
        :host(.collapsed) .nav-link {
          justify-content: center;
          padding: 12px 0;
        }
        
        :host(.collapsed) .icon {
          margin-right: 0;
        }
        
        :host(.collapsed) .logout {
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 50%;
        }
        
        :host(.collapsed) .logout-icon {
          margin-right: 0;
        }
        
        /* Hover States */
        .nav-link:hover {
          background-color: var(--secondary-color);
          color: var(--primary-color);
        }
        
        .nav-link:hover .tooltip {
          opacity: 1;
          visibility: visible;
        }
        
        .toggle-btn:hover {
          background: #f0f0f0;
        }
      </style>
      
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      
      <aside class="sidebar ${this.isCollapsed ? 'collapsed' : ''}" aria-label="Main navigation">
        <button class="toggle-btn" aria-expanded="false" aria-label="Toggle sidebar">☰</button>
        <div class="sidebar-content">
          <div class="top-section">
            <div class="company">
              <img src="../images/logo-final.png" alt="Aqua Spring Logo" width="40" height="40">
              <span class="company-name">Aqua Spring</span>
            </div>
            <div class="user-profile">
              <img id="profile-img" src="${profilePicture}" alt="User Profile width="60" height="60">
              <h2 id="profile-name">${username}</h2>
              <span class="badge" aria-label="Administrator">ADMIN</span>
            </div>
            <nav aria-label="Main menu">
              <ul>
                <li class="nav-item">
                  <a href="../pages/dashboard.html" class="nav-link" aria-current="page">
                    <img src="../images/menu.png" alt="" class="icon" aria-hidden="true">
                    <span class="nav-text">Dashboard</span>
                    <span class="tooltip">Dashboard</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="../pages/remote.html" class="nav-link">
                    <img src="../images/press-button.png" alt="" class="icon" aria-hidden="true">
                    <span class="nav-text">Remote</span>
                    <span class="tooltip">Remote</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="../pages/history.html" class="nav-link">
                    <img src="../images/file.png" alt="" class="icon" aria-hidden="true">
                    <span class="nav-text">History</span>
                    <span class="tooltip">History</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="../pages/settings.html" class="nav-link">
                    <img src="../images/settings.png" alt="" class="icon" aria-hidden="true">
                    <span class="nav-text">Settings</span>
                    <span class="tooltip">Settings</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div class="bottom-section">
            <button class="logout" aria-label="Log out">
              <a href="../index.html" class="logout-link">
                <img src="../images/log-out.png" class="logout-icon" alt="" aria-hidden="true">
                <span class="logout-text">Log out</span>
              </a>
            </button>
          </div>
        </div>
      </aside>
    `;
  
    const toggleBtn = shadow.querySelector('.toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            this.classList.toggle('collapsed');
            const expanded = !this.classList.contains('collapsed');
            toggleBtn.setAttribute('aria-expanded', expanded.toString());

            this.dispatchEvent(new CustomEvent('sidebar-toggle', {
                detail: { collapsed: !expanded },
                bubbles: true,
                composed: true
            }));
        });
    }

    document.addEventListener('click', (e) => {
        if (!this.contains(e.target) && window.innerWidth < 768) {
            this.classList.add('collapsed');
            toggleBtn?.setAttribute('aria-expanded', 'false');
        }
    });
}

updateUsername(newName) {
  const nameElement = this.shadowRoot.getElementById('profile-name');
  if (nameElement) {
      nameElement.textContent = newName;
  }
}

updateProfilePicture(imageSrc) {
  const imgElement = this.shadowRoot.getElementById('profile-img');
  if (imgElement) {
      imgElement.src = imageSrc;
  }
}

connectedCallback() {
  window.addEventListener('storage', (e) => {
      if (e.key === 'username') {
          this.updateUsername(e.newValue);
      }
      if (e.key === 'profilePicture') {
          this.updateProfilePicture(e.newValue || '../images/person.png');
      }
  });
}
}

customElements.define('sidebar-component', SidebarComponent);
document.addEventListener('DOMContentLoaded', () => {
    // File content data
    const fileContents = {
        'notes.txt': `My Personal Notes
---------------------
- Remember to finish the desktop app project
- Call mom on her birthday
- Schedule dentist appointment for next month

These notes are important and I should review them regularly.
        `,
        'todo.txt': `TODO List
----------
[x] Create basic HTML structure
[x] Style the desktop environment
[x] Implement window dragging
[ ] Add more interactive features
[ ] Improve the file system
[ ] Create proper icons
        `,
        'project.txt': `Project Ideas
-------------
1. Virtual Desktop Environment
   - Browser app with dummy content
   - File explorer with text files
   - Window management system

2. Weather Dashboard
   - Current conditions display
   - 5-day forecast
   - Location-based weather

3. Task Management System
   - Create, edit, delete tasks
   - Categories and priority levels
   - Due dates and reminders
        `
    };

    // Clock update
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.querySelector('.time').textContent = timeString;
    }
    
    setInterval(updateClock, 60000);
    updateClock();

    // Track open apps
    const openApps = new Set();
    let activeApp = null;
    let zIndex = 10;

    // Handle icon clicks
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const appName = icon.getAttribute('data-app');
            openApp(appName);
        });
    });

    // Open an application
    function openApp(appName) {
        const appElement = document.getElementById(`${appName}-app`);
        
        if (appElement.style.display === 'none') {
            appElement.style.display = 'flex';
            openApps.add(appName);
            
            // Add to taskbar if not already there
            if (!document.querySelector(`.taskbar-app[data-app="${appName}"]`)) {
                const taskbarApp = document.createElement('div');
                taskbarApp.className = 'taskbar-app';
                taskbarApp.setAttribute('data-app', appName);
                taskbarApp.textContent = appName.charAt(0).toUpperCase() + appName.slice(1);
                taskbarApp.addEventListener('click', () => {
                    if (appElement.style.display === 'none') {
                        openApp(appName);
                    } else {
                        setActiveApp(appName);
                    }
                });
                document.querySelector('.taskbar-apps').appendChild(taskbarApp);
            }
        }
        
        setActiveApp(appName);
    }

    // Set active application
    function setActiveApp(appName) {
        if (activeApp) {
            const prevApp = document.getElementById(`${activeApp}-app`);
            if (prevApp) {
                prevApp.style.zIndex = 5;
            }
            document.querySelector(`.taskbar-app[data-app="${activeApp}"]`)?.classList.remove('active');
        }
        
        activeApp = appName;
        const appElement = document.getElementById(`${appName}-app`);
        appElement.style.zIndex = ++zIndex;
        document.querySelector(`.taskbar-app[data-app="${appName}"]`).classList.add('active');
    }

    // Window controls
    document.querySelectorAll('.window-controls .close').forEach(button => {
        button.addEventListener('click', (e) => {
            const appWindow = e.target.closest('.app-window, .file-viewer');
            appWindow.style.display = 'none';
            
            // If it's an app window (not file viewer)
            if (appWindow.id) {
                const appName = appWindow.id.replace('-app', '');
                openApps.delete(appName);
                document.querySelector(`.taskbar-app[data-app="${appName}"]`).remove();
                
                if (activeApp === appName) {
                    activeApp = null;
                }
            }
        });
    });

    // Make windows draggable
    document.querySelectorAll('.window-header').forEach(header => {
        makeDraggable(header);
    });

    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;
        
        element.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            
            const appWindow = element.closest('.app-window, .file-viewer');
            
            // If it's an app, make it active
            if (appWindow.id) {
                const appName = appWindow.id.replace('-app', '');
                setActiveApp(appName);
            } else {
                appWindow.style.zIndex = ++zIndex;
            }
            
            const rect = appWindow.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            isDragging = true;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const appWindow = element.closest('.app-window, .file-viewer');
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Ensure window stays within viewport
            const maxX = window.innerWidth - appWindow.offsetWidth;
            const maxY = window.innerHeight - appWindow.offsetHeight;
            
            appWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            appWindow.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
            appWindow.style.transform = 'none';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Explorer file handling
    document.querySelectorAll('.file-item').forEach(file => {
        file.addEventListener('click', () => {
            const fileName = file.getAttribute('data-file');
            openFile(fileName);
        });
    });

    // Open text file
    function openFile(fileName) {
        const fileViewer = document.querySelector('.file-viewer');
        const fileContent = document.querySelector('.file-content');
        
        fileContent.textContent = fileContents[fileName] || 'File content not available.';
        fileViewer.querySelector('.window-title').textContent = fileName;
        fileViewer.style.display = 'flex';
        fileViewer.style.zIndex = ++zIndex;
    }

    // Browser login functionality
    const loginPage = document.querySelector('.login-page');
    const dummyPage = document.querySelector('.dummy-page');
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    // Correct credentials
    const correctUsername = "CTRL_SHUT";
    const correctPassword = "CTRL1237=EP";
    
    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (username === correctUsername && password === correctPassword) {
            loginPage.style.display = 'none';
            document.querySelector('.dashboard-page').style.display = 'block';
            loginError.textContent = '';
        } else {
            loginError.textContent = 'Invalid username or password';
            passwordInput.value = '';
        }
    });
    
    // Handle Enter key in password field
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });

    // Handle browser back/forward/refresh buttons
    document.querySelector('.browser-toolbar .back').addEventListener('click', () => {
        alert('Browser: Back button clicked');
    });
    
    document.querySelector('.browser-toolbar .forward').addEventListener('click', () => {
        alert('Browser: Forward button clicked');
    });
    
    document.querySelector('.browser-toolbar .refresh').addEventListener('click', () => {
        alert('Browser: Refresh button clicked');
    });

    // Handle address bar
    document.querySelector('.address-bar input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            alert(`Browser: Navigating to ${e.target.value}`);
        }
    });

    // Handle dashboard navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            
            // Hide all pages
            document.querySelectorAll('.dashboard-page, .upcoming-page, .snippets-page').forEach(p => {
                p.style.display = 'none';
            });
            
            // Show selected page
            document.querySelector(`.${page}-page`).style.display = 'block';
            
            // Update active button
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Set all buttons with same data-page to active
            document.querySelectorAll(`.nav-btn[data-page="${page}"]`).forEach(b => {
                b.classList.add('active');
            });
        });
    });

    // Revamped audio snippets functionality
    let currentAudio = null;
    let currentButton = null;
    
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const audioFile = this.getAttribute('data-file');
            const playerContainer = this.closest('.snippet-player');
            const progressBar = playerContainer.querySelector('.progress');
            const durationElement = playerContainer.querySelector('.duration');
            
            // If there's already audio playing
            if (currentAudio) {
                currentAudio.pause();
                // Remove event listeners to prevent callbacks after nullification
                currentAudio.ontimeupdate = null;
                currentAudio.onended = null;
                
                if (currentButton === this) {
                    // User clicked the currently playing button - stop playback
                    resetPlayer(currentButton);
                    currentAudio = null;
                    currentButton = null;
                    return;
                } else {
                    // User clicked a different button - reset the previous one
                    resetPlayer(currentButton);
                }
            }
            
            // Set current button and initialize new audio
            currentButton = this;
            
            // Update button appearance to show loading state
            this.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="30 30" class="loading-circle"></circle></svg>';
            this.classList.add('loading');
            
            // Create or use existing audio element
            currentAudio = new Audio(audioFile);
            
            // Set up audio event listeners
            currentAudio.onloadedmetadata = function() {
                // Format duration (30 seconds snippets)
                const duration = Math.min(currentAudio.duration, 30);
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                durationElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            };
            
            currentAudio.oncanplaythrough = function() {
                // Change button to pause icon when ready to play
                if (currentButton) { // Safety check
                    currentButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="6" y="4" width="4" height="16" fill="#333"/><rect x="14" y="4" width="4" height="16" fill="#333"/></svg>';
                    currentButton.classList.remove('loading');
                    currentButton.classList.add('playing');
                    
                    // Start playback
                    currentAudio.play().catch(error => {
                        console.error("Audio playback error:", error);
                        resetPlayer(currentButton);
                    });
                }
            };
            
            currentAudio.onerror = function() {
                console.error("Error loading audio file:", audioFile);
                resetPlayer(currentButton);
                
                // Show error message
                durationElement.textContent = "Error";
                durationElement.classList.add('error');
            };
            
            // Update time display and progress bar
            currentAudio.ontimeupdate = function() {
                // Safety check to prevent error when audio or button has been nullified
                if (!currentAudio || !currentButton) return;
                
                const localPlayerContainer = currentButton.closest('.snippet-player');
                const localProgressBar = localPlayerContainer.querySelector('.progress');
                
                if (currentAudio.duration) {
                    // Limit to 30 seconds for snippets
                    const maxTime = Math.min(currentAudio.currentTime, 30);
                    const percent = (maxTime / Math.min(currentAudio.duration, 30)) * 100;
                    
                    if (localProgressBar) {
                        localProgressBar.style.width = percent + '%';
                    }
                    
                    // Update time display
                    const currentTime = Math.floor(maxTime);
                    const minutes = Math.floor(currentTime / 60);
                    const seconds = Math.floor(currentTime % 60);
                    
                    const currentTimeElement = localPlayerContainer.querySelector('.current-time');
                    if (currentTimeElement) {
                        currentTimeElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    }
                    
                    // Stop after 30 seconds
                    if (currentAudio.currentTime >= 30) {
                        currentAudio.pause();
                        resetPlayer(currentButton);
                        // Remove event listeners before nullification
                        currentAudio.ontimeupdate = null;
                        currentAudio.onended = null;
                        currentAudio = null;
                        currentButton = null;
                    }
                }
            };
            
            currentAudio.onended = function() {
                if (currentButton) { // Safety check
                    resetPlayer(currentButton);
                    // Remove event listeners before nullification
                    if (currentAudio) currentAudio.ontimeupdate = null;
                    currentAudio = null;
                    currentButton = null;
                }
            };
            
            // Add click on progress bar to seek
            const seekBar = playerContainer.querySelector('.progress-bar');
            const seekFunction = function(e) {
                if (!currentAudio) return;
                
                const rect = this.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                const seekTime = pos * Math.min(currentAudio.duration, 30);
                
                currentAudio.currentTime = seekTime;
            };
            
            // Remove previous event listener to avoid duplicates
            seekBar.removeEventListener('click', seekFunction);
            seekBar.addEventListener('click', seekFunction);
        });
    });

    function resetPlayer(button) {
        if (!button) return;
        
        button.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><polygon points="5,3 19,12 5,21" fill="#333"/></svg>';
        button.classList.remove('playing', 'loading');
        
        const playerContainer = button.closest('.snippet-player');
        if (!playerContainer) return;
        
        const progressElement = playerContainer.querySelector('.progress');
        if (progressElement) {
            progressElement.style.width = '0%';
        }
        
        const currentTimeElement = playerContainer.querySelector('.current-time');
        if (currentTimeElement) {
            currentTimeElement.textContent = '0:00';
        }
        
        const durationElement = playerContainer.querySelector('.duration');
        if (durationElement) {
            durationElement.classList.remove('error');
        }
    }
});
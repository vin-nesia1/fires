// Authentication utility functions
// This file can be included in any page that needs authentication

class AuthUtils {
    constructor() {
        this.checkAuthStatus();
        this.setupAuthListener();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return localStorage.getItem('userLoggedIn') === 'true';
    }

    // Get current user info
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        
        return {
            email: localStorage.getItem('userEmail'),
            uid: localStorage.getItem('userId'),
            loggedIn: true
        };
    }

    // Set user authentication status
    setAuthStatus(user) {
        if (user) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userId', user.uid);
        } else {
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
        }
        
        // Dispatch event for other components
        this.dispatchAuthChange(user);
    }

    // Clear authentication
    clearAuth() {
        this.setAuthStatus(null);
    }

    // Dispatch authentication state change event
    dispatchAuthChange(user) {
        const event = new CustomEvent('authStateChanged', {
            detail: {
                user: user,
                loggedIn: !!user
            }
        });
        window.dispatchEvent(event);
    }

    // Redirect to login page
    redirectToLogin(returnUrl = null) {
        const url = new URL('login.html', window.location.origin);
        if (returnUrl) {
            url.searchParams.set('returnUrl', returnUrl);
        } else {
            url.searchParams.set('returnUrl', window.location.href);
        }
        window.location.href = url.toString();
    }

    // Require authentication for a function
    requireAuth(callback, redirectToLogin = true) {
        if (this.isAuthenticated()) {
            callback();
            return true;
        } else {
            if (redirectToLogin) {
                this.redirectToLogin();
            }
            return false;
        }
    }

    // Setup authentication state listener
    setupAuthListener() {
        // Listen for storage changes (for multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === 'userLoggedIn') {
                const user = e.newValue === 'true' ? this.getCurrentUser() : null;
                this.dispatchAuthChange(user);
            }
        });
    }

    // Check auth status on page load
    checkAuthStatus() {
        if (this.isAuthenticated()) {
            const user = this.getCurrentUser();
            this.dispatchAuthChange(user);
        }
    }

    // Logout function
    async logout() {
        try {
            // If Firebase auth is available, use it
            if (window.firebaseAuth && window.firebaseAuth.auth) {
                await window.firebaseAuth.signOut(window.firebaseAuth.auth);
            }
            
            // Always clear local storage as fallback
            this.clearAuth();
            
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage even if Firebase logout fails
            this.clearAuth();
            return false;
        }
    }

    // Show login modal (if exists on page)
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('show');
            return true;
        }
        return false;
    }

    // Hide login modal (if exists on page)
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('show');
            return true;
        }
        return false;
    }

    // Protect page - redirect to login if not authenticated
    protectPage() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
        }
    }

    // Initialize authentication UI elements
    initAuthUI() {
        // Setup logout button if exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Setup modal buttons if they exist
        const modalLoginBtn = document.getElementById('modal-login-btn');
        const modalRegisterBtn = document.getElementById('modal-register-btn');
        
        if (modalLoginBtn) {
            modalLoginBtn.addEventListener('click', () => {
                this.redirectToLogin();
            });
        }

        if (modalRegisterBtn) {
            modalRegisterBtn.addEventListener('click', () => {
                this.redirectToLogin();
            });
        }

        // Setup close modal when clicking outside
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                }
            });
        }

        // Update UI based on auth state
        this.updateAuthUI();
        
        // Listen for auth state changes
        window.addEventListener('authStateChanged', (e) => {
            this.updateAuthUI(e.detail.loggedIn, e.detail.user);
        });
    }

    // Update UI based on authentication state
    updateAuthUI(isLoggedIn = null, user = null) {
        if (isLoggedIn === null) {
            isLoggedIn = this.isAuthenticated();
        }
        
        if (user === null) {
            user = this.getCurrentUser();
        }

        // Update user info display
        const userInfo = document.getElementById('user-info');
        const userEmail = document.getElementById('user-email');
        
        if (userInfo && userEmail) {
            if (isLoggedIn && user) {
                userEmail.textContent = user.email;
                userInfo.style.display = 'flex';
            } else {
                userInfo.style.display = 'none';
            }
        }

        // Hide login modal if user is logged in
        if (isLoggedIn) {
            this.hideLoginModal();
        }
    }
}

// Create global instance
window.authUtils = new AuthUtils();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthUtils;
}

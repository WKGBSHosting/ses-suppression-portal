// Authentication Manager
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.accessToken = null;
        this.demoMode = true; // Enable demo mode
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('sso-login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.initiateLogin());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    checkExistingSession() {
        const token = localStorage.getItem('ses_portal_token');
        const userInfo = localStorage.getItem('ses_portal_user');
        
        if (token && userInfo) {
            try {
                this.accessToken = token;
                this.userInfo = JSON.parse(userInfo);
                this.isAuthenticated = true;
                this.showMainApp();
            } catch (error) {
                console.error('Error parsing stored user info:', error);
                this.clearSession();
            }
        }
    }

    async initiateLogin() {
        const loginBtn = document.getElementById('sso-login-btn');
        
        try {
            // Show loading state
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            loginBtn.disabled = true;

            if (this.demoMode) {
                await this.simulateLogin();
            } else {
                await this.performRealLogin();
            }
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            // Reset button state
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login with AWS SSO';
            loginBtn.disabled = false;
        }
    }

    async simulateLogin() {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create demo user
        this.userInfo = {
            name: 'Demo User',
            email: 'demo@example.com',
            groups: ['SES-Portal-Users'],
            region: 'us-east-1',
            accountId: '123456789012'
        };
        
        this.accessToken = 'demo-token-' + Date.now();
        this.isAuthenticated = true;
        
        // Store session
        localStorage.setItem('ses_portal_token', this.accessToken);
        localStorage.setItem('ses_portal_user', JSON.stringify(this.userInfo));
        
        this.showMainApp();
        this.showSuccessMessage('Demo login successful!');
    }

    async performRealLogin() {
        // Real AWS SSO implementation would go here
        // This would involve OIDC flow with AWS SSO
        throw new Error('Real SSO not implemented in demo');
    }

    showMainApp() {
        const loginSection = document.getElementById('login-section');
        const mainApp = document.getElementById('main-app');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');

        if (loginSection) loginSection.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        
        if (userName && this.userInfo) {
            userName.textContent = this.userInfo.name;
        }
        
        if (userEmail && this.userInfo) {
            userEmail.textContent = this.userInfo.email;
        }

        // Animate the transition
        if (mainApp) {
            mainApp.style.opacity = '0';
            setTimeout(() => {
                mainApp.style.transition = 'opacity 0.5s ease';
                mainApp.style.opacity = '1';
            }, 100);
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.accessToken = null;
        
        this.clearSession();
        this.showLoginScreen();
        this.showSuccessMessage('Logged out successfully');
    }

    clearSession() {
        localStorage.removeItem('ses_portal_token');
        localStorage.removeItem('ses_portal_user');
    }

    showLoginScreen() {
        const loginSection = document.getElementById('login-section');
        const mainApp = document.getElementById('main-app');

        if (mainApp) mainApp.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Getters
    getAccessToken() {
        return this.accessToken;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getUserInfo() {
        return this.userInfo;
    }
}

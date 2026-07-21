const CONFIG = {
    // IMPORTANT: Set demo mode to FALSE
    DEMO_MODE: false,
    
    // Your real API endpoint (replace with actual URL)
    API: {
        ENDPOINT: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev',
        REGION: 'us-east-1',
        TIMEOUT: 30000
    },
    
    // Real authentication (if using corporate SSO)
    SSO: {
        PROVIDER: 'demo', // Change to 'azure', 'google', etc. for real SSO
        CLIENT_ID: 'your-client-id',
        REDIRECT_URI: 'https://YOUR-USERNAME.github.io/ses-suppression-portal/auth/callback'
    },
    
    // AWS Regions (same as before)
    REGIONS: [
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'us-gov-east-1', 'us-gov-west-1',
        'ap-south-1', 'ap-south-2', 'ap-southeast-1', 'ap-southeast-2',
        'ap-southeast-3', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
        'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
        'eu-west-3', 'eu-north-1', 'eu-south-1', 'eu-south-2',
        'il-central-1', 'me-south-1', 'me-central-1',
        'sa-east-1', 'af-south-1'
    ]
};

window.CONFIG = CONFIG;

const AWS = require('aws-sdk');

// SES Search Handler
exports.sesSearch = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        console.log('Event:', JSON.stringify(event, null, 2));

        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: ''
            };
        }

        // Validate request method
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        // Parse request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body || '{}');
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { email, region, searchType } = requestBody;
        
        // Validate required parameters
        if (!email || !region) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required parameters',
                    required: ['email', 'region']
                })
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid email format' })
            };
        }

        console.log(`Searching for ${email} in region ${region} with type ${searchType}`);

        // Search SES suppression list
        const result = await searchSESSuppressionInRegion(email, region, searchType);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Error in sesSearch:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

// Health Check Handler
exports.health = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            region: process.env.AWS_REGION || 'unknown'
        })
    };
};

// SES Search Function
async function searchSESSuppressionInRegion(email, region, searchType) {
    // Create SES client for the specific region
    const sesv2 = new AWS.SESV2({ 
        region: region,
        maxRetries: 3,
        retryDelayOptions: {
            customBackoff: function(retryCount) {
                return Math.pow(2, retryCount) * 100;
            }
        }
    });
    
    try {
        console.log(`Checking suppression for ${email} in ${region}`);
        
        // Try to get the specific suppressed destination
        const response = await sesv2.getSuppressedDestination({
            EmailAddress: email
        }).promise();
        
        const suppression = response.SuppressedDestination;
        console.log(`Found suppression in ${region}:`, suppression);
        
        // Filter by search type if specified
        if (searchType && searchType !== 'all') {
            if (suppression.Reason.toLowerCase() !== searchType.toLowerCase()) {
                console.log(`Suppression reason ${suppression.Reason} doesn't match filter ${searchType}`);
                return { suppressions: [] };
            }
        }
        
        return {
            suppressions: [{
                emailAddress: suppression.EmailAddress,
                reason: suppression.Reason,
                lastUpdateTime: suppression.LastUpdateTime,
                region: region
            }],
            searchTime: new Date().toISOString(),
            status: 'success'
        };
        
    } catch (error) {
        console.log(`Error checking ${region}:`, error.code, error.message);
        
        if (error.code === 'NotFoundException') {
            // Email not found in suppression list - this is normal
            console.log(`No suppression found for ${email} in ${region}`);
            return { 
                suppressions: [],
                searchTime: new Date().toISOString(),
                status: 'not_found'
            };
        } else if (error.code === 'UnauthorizedOperation' || 
                   error.code === 'InvalidAction' || 
                   error.statusCode === 403) {
            // SES not available in this region or no permissions
            console.log(`SES not available or no permissions in ${region}`);
            return { 
                suppressions: [], 
                error: 'SES not available in this region or insufficient permissions',
                searchTime: new Date().toISOString(),
                status: 'unavailable'
            };
        } else if (error.code === 'InvalidParameterValue') {
            return {
                suppressions: [],
                error: 'Invalid email address format',
                searchTime: new Date().toISOString(),
                status: 'invalid_parameter'
            };
        } else {
            // Other errors - rethrow to be handled by main error handler
            console.error(`Unexpected error in ${region}:`, error);
            throw new Error(`SES API error in ${region}: ${error.message}`);
        }
    }
}

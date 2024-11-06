import api from '../config/axios';

// Example API call
const makeApiCall = async () => {
    try {
        const response = await api.post('/generate-questions-title', {
            message: 'Your message here'
        });
        console.log(response.data);
    } catch (error) {
        console.error('API call failed:', error);
    }
}; 
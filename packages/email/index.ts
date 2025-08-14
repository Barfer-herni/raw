import { Resend } from 'resend';
import { keys } from './keys';

// Create a conditional Resend instance that may be null if token is not available
const createResendInstance = () => {
    try {
        const token = keys().RESEND_TOKEN;
        if (!token) {
            console.warn('Resend token not found, email functionality will be disabled');
            return null;
        }
        return new Resend(token);
    } catch (error) {
        console.warn('Failed to initialize Resend:', error);
        return null;
    }
};

const resend = createResendInstance();

export default resend;

export * from './templates/contact';
export * from './templates/BulkEmailTemplate';

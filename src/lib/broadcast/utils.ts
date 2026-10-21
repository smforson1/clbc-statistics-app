/**
 * Utility functions for broadcast communications
 */

/**
 * Normalizes phone numbers, specifically handling Ghanaian numbers
 * e.g., 0241234567 -> +233241234567
 */
export function formatPhoneNumber(phone: string, defaultCountryCode = '+233'): string {
    if (!phone) return '';

    // Remove all whitespace, dashes, brackets
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

    // If starts with +, keep it
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // If starts with 00, replace with +
    if (cleaned.startsWith('00')) {
        return '+' + cleaned.slice(2);
    }

    // If starts with 233, prefix with +
    if (cleaned.startsWith('233')) {
        return '+' + cleaned;
    }

    // If starts with 0, replace with default country code
    if (cleaned.startsWith('0')) {
        return defaultCountryCode + cleaned.slice(1);
    }

    // If no leading 0 or +, add default country code
    return defaultCountryCode + cleaned;
}

/**
 * Replaces dynamic placeholders in message template
 * Placeholders: {fullname}, {firstname}, {church}, {date}, {branch}
 */
export function personalizeMessage(
    template: string,
    params: {
        fullname?: string;
        churchName?: string;
        branchName?: string;
        date?: string;
    }
): string {
    const name = params.fullname?.trim() || 'Beloved';
    const firstName = name.split(' ')[0] || name;
    const church = params.churchName || 'Christ Love Breed Church';
    const branch = params.branchName || 'CLBC';
    const dateStr = params.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return template
        .replace(/{fullname}/gi, name)
        .replace(/{firstname}/gi, firstName)
        .replace(/{name}/gi, name)
        .replace(/{church}/gi, church)
        .replace(/{branch}/gi, branch)
        .replace(/{date}/gi, dateStr);
}

/**
 * Builds a direct WhatsApp Web / app link for manual or hybrid sending
 */
export function buildWhatsAppWebUrl(phone: string, message: string): string {
    const formatted = formatPhoneNumber(phone).replace('+', '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${formatted}?text=${encoded}`;
}


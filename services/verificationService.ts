// --- REAL VERIFICATION SERVICE ---
// This service makes API calls to the Vercel serverless backend.

interface InitialLoginResult {
    success: boolean;
    message?: string;
    redepositCount?: number;
}

interface RedepositResult {
    success: boolean;
    message?: string;
    newRedepositCount?: number;
}

export const verificationService = {
    async verifyInitialLogin(userId: string): Promise<InitialLoginResult> {
        try {
            const response = await fetch(`/api/verify-login?userId=${encodeURIComponent(userId)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
                return { success: false, message: errorData.message };
            }
            const data = await response.json();
            return data; // e.g., { success: true, redepositCount: 0 }
        } catch (error) {
            console.error("Verification service error:", error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    },

    async verifyRedeposit(userId: string, knownRedeposits: number): Promise<RedepositResult> {
        try {
            const response = await fetch(`/api/verify-redeposit?userId=${encodeURIComponent(userId)}&knownRedeposits=${knownRedeposits}`);
             if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
                return { success: false, message: errorData.message };
            }
            const data = await response.json();
            return data; // e.g., { success: true, newRedepositCount: 1 }
        } catch (error) {
            console.error("Redeposit verification error:", error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    },
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface UserData {
  id: string;
  hasFirstDeposit: boolean;
  redepositCount: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add check for KV store configuration
  if (!process.env.KV_URL) {
    return res.status(500).json({ 
        success: false,
        message: "KV Database is not connected. Please go to the Storage tab in your Vercel project and connect a KV store." 
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const dbKey = `user:${userId}`;
    const userData = await kv.get<UserData>(dbKey);

    if (userData) {
      // User exists in the database. Now check if they have deposited.
      if (userData.hasFirstDeposit) {
        // SUCCESS: User has registered AND made a qualifying first deposit.
        res.status(200).json({
          success: true,
          redepositCount: userData.redepositCount || 0,
        });
      } else {
        // FAILURE: User has registered but NOT made a qualifying deposit yet.
        const needsDepositMessage = `🎉 Great, you have successfully completed registration!
✅ Your account is synchronized with the app
💴 To gain access to signals, deposit your account (make a deposit) with at least $5 in any currency
🕹️ After successfully replenishing your account, Enter Your Players I'd to get access.`;
        res.status(403).json({
          success: false,
          message: needsDepositMessage,
        });
      }
    } else {
      // FAILURE: User does not exist in the database at all.
      const notRegisteredMessage = `No registration found yet!
Please wait 2-5 minutes after registration and enter your Player ID again.`;
      res.status(403).json({
        success: false,
        message: notRegisteredMessage,
      });
    }
  } catch (error) {
    console.error('Login verification error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error during login. Check server logs.' });
  }
}
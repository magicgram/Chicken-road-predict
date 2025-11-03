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
    const { userId, knownRedeposits } = req.query;

    if (!userId || typeof userId !== 'string' || !knownRedeposits) {
      return res.status(400).json({ message: 'User ID and known redeposits are required' });
    }

    const knownCount = parseInt(knownRedeposits as string, 10);
    if (isNaN(knownCount)) {
        return res.status(400).json({ message: 'Invalid knownRedeposits value' });
    }

    const dbKey = `user:${userId}`;
    const userData = await kv.get<UserData>(dbKey);
    const currentCount = userData?.redepositCount || 0;

    // A successful re-deposit means the count in the database is greater
    // than the count the user's app session last knew about.
    if (currentCount > knownCount) {
      res.status(200).json({
        success: true,
        newRedepositCount: currentCount,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Deposit not confirmed yet. Please wait a moment and try again.",
      });
    }
  } catch (error) {
    console.error('Redeposit verification error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error during re-deposit check. Check server logs.' });
  }
}
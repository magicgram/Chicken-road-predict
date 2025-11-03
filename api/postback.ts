import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// This is a Vercel Serverless Function that acts as our backend endpoint.
// It will be accessible at https://your-app-name.vercel.app/api/postback

// Minimum deposit amounts
const MIN_FIRST_DEPOSIT_USD = 5;
const MIN_REPEATED_DEPOSIT_USD = 4;

interface UserData {
  id: string;
  hasFirstDeposit: boolean;
  redepositCount: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add check for KV store configuration
  if (!process.env.KV_URL) {
    return res.status(500).json({ 
        message: "KV Database is not connected. Please go to the Storage tab in your Vercel project and connect a KV store." 
    });
  }

  // We only accept GET requests as per 1Win postback standard
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { user_id, status, fdp_usd, dep_sum_usd } = req.query;

    // The user_id is essential. If it's missing, we can't do anything.
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid user_id' });
    }

    const userId = user_id;
    const dbKey = `user:${userId}`;

    // Fetch existing user data from Vercel KV, or create a new object if none exists.
    const existingData = await kv.get<UserData>(dbKey);
    const userData: UserData = existingData || {
      id: userId,
      hasFirstDeposit: false,
      redepositCount: 0,
    };

    // Process based on the status sent by 1Win
    switch (status) {
      case 'registration':
        // We can just acknowledge the registration.
        // The important part is the deposit.
        // No change to userData needed, but we could log it.
        break;

      case 'fdp': // First Deposit
        const firstDepositAmount = parseFloat(fdp_usd as string);
        if (!isNaN(firstDepositAmount) && firstDepositAmount >= MIN_FIRST_DEPOSIT_USD) {
          userData.hasFirstDeposit = true;
        }
        break;
      
      // Assuming 'dep' is the status for a repeated deposit
      case 'dep': 
        const repeatedDepositAmount = parseFloat(dep_sum_usd as string);
        if (!isNaN(repeatedDepositAmount) && repeatedDepositAmount >= MIN_REPEATED_DEPOSIT_USD) {
          userData.redepositCount = (userData.redepositCount || 0) + 1;
        }
        break;
    }

    // Save the updated user data back to Vercel KV.
    await kv.set(dbKey, userData);

    // Respond with a 200 OK to let 1Win know we received the postback successfully.
    res.status(200).json({ message: 'Postback received' });

  } catch (error) {
    console.error('Postback processing error:', error);
    // Send a 500 error if something goes wrong on our end.
    res.status(500).json({ message: 'Internal Server Error processing postback. Check server logs.' });
  }
}
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    orgId: string;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get organization info from Supabase
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        org_id,
        organizations (
          id,
          name,
          plan
        )
      `)
      .eq('email', user.email)
      .single();

    if (userError || !dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email!,
      orgId: dbUser.org_id
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
} 
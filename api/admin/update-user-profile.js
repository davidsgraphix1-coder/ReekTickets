import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, fullName, profilePic } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const updatePayload = {
      fullName: fullName.trim(),
      profilePic: profilePic && profilePic.trim() ? profilePic.trim() : null
    };

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ message: 'User profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

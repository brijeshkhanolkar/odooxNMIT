'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateOwnProfile } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

interface ProfileEditorProps {
  profile: Profile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateOwnProfile({ phone, address });
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', 'Profile updated successfully');
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const fileName = `${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast('error', 'Failed to upload photo');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

    const result = await updateOwnProfile({ avatarUrl: publicUrl });
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', 'Profile photo updated');
      window.location.reload();
    }
    setUploading(false);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Profile</h3>
      <p className="text-sm text-slate-500 mb-4">You can update your phone number, address, and profile photo.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
        </div>

        <Input
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
        />

        <Textarea
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
        />

        <Button onClick={handleSave} loading={loading}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}

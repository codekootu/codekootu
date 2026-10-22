'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, User, Mail, Save, Loader2, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function getProfile() {
      // 1. Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const userEmail = session.user.email || '';
      setEmail(userEmail);

      // 2. Query public.profiles
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(
          data.full_name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          ''
        );
        setPhone(data.phone || '');
      } else {
        // Fallback if record doesn't exist yet
        setFullName(
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          ''
        );
      }
      setLoading(false);
    }
    getProfile();
  }, [supabase, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Error uploading avatar: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const bustedUrl = `${publicUrl}?t=${new Date().getTime()}`;

    await supabase
      .from('profiles')
      .update({ avatar_url: bustedUrl })
      .eq('id', profile.id);

    setProfile((prev: any) => ({ ...prev, avatar_url: bustedUrl }));
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq('id', profile.id);

    if (error) alert('Error saving profile: ' + error.message);
    else alert('Profile saved successfully!');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#05070a] flex items-center justify-center text-[#dfe7e0]">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#2dd4bf]" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans overflow-hidden">
      {/* Header with Back and Sign Out actions */}
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center justify-between px-8 bg-[#0a0e12]">
        <div className="flex items-center">
          <Link
            href="/portal/dashboard"
            className="text-[#78837c] hover:text-white transition-colors mr-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-normal tracking-tight">Your Profile</h1>
            <p className="text-xs text-[#78837c]">Manage your personal information</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs font-mono text-[#78837c] hover:text-red-400 py-1.5 px-3 rounded-lg border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-xl p-8 shadow-2xl">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#dfe7e0]/20 group-hover:border-[#2dd4bf] transition-colors bg-[#05070a] flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-[#78837c]" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-[#78837c] mt-3">Click to upload a new avatar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="group">
              <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-[#78837c]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-[#2dd4bf] transition-colors"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block">
                Email Address (Locked)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#78837c]" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#05070a]/50 border border-[#dfe7e0]/5 rounded-lg pl-12 pr-4 py-3 text-[#78837c] outline-none cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#2dd4bf] transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 mt-8 bg-[#dfe7e0] text-[#05070a] font-medium rounded-lg hover:bg-white hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

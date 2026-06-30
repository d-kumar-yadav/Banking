import { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { User, Mail, Phone, Calendar, CreditCard, ShieldCheck, MapPin, Smile } from 'lucide-react';
import toast from 'react-hot-toast';
import LottiePackage from "lottie-react";
import coinAnimation from "../../assets/Fake 3D vector coin.json";

const Lottie = LottiePackage.default || LottiePackage;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/profile');
        if (res.data.success) {
          setProfile(res.data.user);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 h-full">
        <div className="w-40 h-40"><Lottie animationData={coinAnimation} loop={true} /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 h-full">
        <h3 className="text-xl font-semibold text-slate-700">Profile Not Found</h3>
        <p className="text-slate-500 mt-2">We couldn't retrieve your profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-2xl font-semibold text-slate-500 flex items-center gap-2">
          Welcome back <span className="text-2xl origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span>
        </h2>
        <h1 className="text-5xl font-black tracking-tight text-slate-800 space-x-8">
          <span className="bg-gradient-to-r from-[#5B0A1C] to-rose-600 bg-clip-text text-transparent">
            {profile.name}
          </span>
        </h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Here are your profile details and settings.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex-1 overflow-auto">
        
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-200/60">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
             <User className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-slate-500 mt-1 capitalize">{profile.role || 'Customer'}</p>
            <span className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              Active Member
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProfileCard 
            icon={<Mail className="w-5 h-5" />} 
            label="Email Address" 
            value={profile.email || 'Not Available'} 
          />
          <ProfileCard 
            icon={<Phone className="w-5 h-5" />} 
            label="Phone Number" 
            value={profile.phone || 'Not Available'} 
          />
          <ProfileCard 
            icon={<User className="w-5 h-5" />} 
            label="Gender" 
            value={profile.gender || 'Not Available'} 
          />
          <ProfileCard 
            icon={<Calendar className="w-5 h-5" />} 
            label="Date of Birth" 
            value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not Available'} 
          />
          <ProfileCard 
            icon={<CreditCard className="w-5 h-5" />} 
            label="PAN Number" 
            value={profile.pan_id ? profile.pan_id : 'Not Available'} 
          />
          <ProfileCard 
            icon={<ShieldCheck className="w-5 h-5" />} 
            label="Aadhaar ID" 
            value={profile.adhar_id ? profile.adhar_id : 'Not Available'} 
          />
        </div>

        {profile.address && (
          <div className="mt-6">
            <ProfileCard 
              icon={<MapPin className="w-5 h-5" />} 
              label="Address" 
              value={profile.address} 
              fullWidth
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileCard = ({ icon, label, value, fullWidth }) => {
  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-4 transition-all hover:shadow-sm hover:border-[#5B0A1C]/30 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className={`p-3 rounded-xl bg-[#5B0A1C]/5 text-[#5B0A1C]`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-800 mt-1 break-all">{value}</p>
      </div>
    </div>
  );
};

export default Profile;


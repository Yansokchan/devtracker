import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(
    user.user_metadata?.avatar_url || ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, avatar_url: avatarUrl },
    });
    setSaving(false);
    setMessage(error ? error.message : "Profile updated!");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-20 h-20 mb-2">
          <AvatarImage src={avatarUrl} alt={fullName || user.email} />
          <AvatarFallback>
            {fullName
              ? fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : user.email?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-lg font-medium mt-2">{user.email}</span>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Link to your avatar image"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#B45309] text-white py-2 rounded font-semibold hover:bg-[#a05a13] transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && <div className="text-center text-sm mt-2">{message}</div>}
      </form>
    </div>
  );
}

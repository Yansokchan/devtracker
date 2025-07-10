import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Loader2, Crown, ListChecks, Bot } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";

export default function Profile({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(
    user.user_metadata?.avatar_url || ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState("free");
  const [taskLimit, setTaskLimit] = useState(0);
  const [aiGenerateLimit, setAiGenerateLimit] = useState(0);

  useEffect(() => {
    async function fetchUserDetails() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select("subscription_plan, task_limit, ai_generate_limit")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setPlan(data.subscription_plan || "free");
        setTaskLimit(data.task_limit ?? 0);
        setAiGenerateLimit(data.ai_generate_limit ?? 0);
      }
    }
    fetchUserDetails();
  }, [user]);

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
    <div className="mt-8 flex flex-col items-center w-full px-2 sm:px-4 md:px-8 lg:flex-row lg:items-start lg:justify-between lg:space-x-12 lg:space-y-0 space-y-8">
      {/* Main Profile Card - Responsive Glassmorphism Design */}
      <Card className="bg-[#f6f4f0] p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center w-full max-w-lg mx-auto animate-fade-in">
        <div className="relative mb-6">
          <div className="rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-600 to-yellow-400 shadow-xl">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shadow-xl ring-[5px] ring-white/60">
              <AvatarImage src={avatarUrl} alt={fullName || user.email} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-2xl sm:text-3xl md:text-4xl">
                {fullName
                  ? fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                  : user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-3 -right-3 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white/80 animate-bounce">
            <Crown className="w-4 h-4 mr-1" />
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight drop-shadow-sm text-center">
          {fullName || "No Name"}
        </h1>
        <p className="text-gray-500 mb-6 flex items-center gap-2 text-base justify-center">
          <Mail className="w-5 h-5 text-amber-500" />
          {user.email}
        </p>

        <div className="w-full border-t border-gray-200 my-4" />

        <form onSubmit={handleSave} className="w-full space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              className="w-full bg-white/90 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-lg shadow-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          {/* Avatar URL input removed as per user change */}
          <button
            type="submit"
            className="w-full bg-[#b46309] text-white py-3 rounded-xl font-medium text-lg shadow-md hover:scale-[1.03] hover:shadow-xl transition-all duration-150 disabled:opacity-70 flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          {message && (
            <div
              className={`text-center text-sm p-2 rounded-xl mt-2 transition-all duration-200 ${
                message.includes("success")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </Card>

      {/* Stats Grid - Redesigned to match Dashboard Stat Cards */}
      <div className="w-full max-w-xs mx-auto grid grid-cols-1 gap-6 sm:gap-8 animate-fade-in">
        <StatCard
          title="Current Plan"
          value={plan.charAt(0).toUpperCase() + plan.slice(1)}
          change="Upgrade plan →"
          changeType="neutral"
          icon={Crown}
          gradient="red"
          textColor="text-[#B46309]"
        />
        <StatCard
          title="Task Limit"
          value={taskLimit === -1 ? "Unlimited" : taskLimit}
          change={taskLimit === -1 ? undefined : undefined}
          changeType="neutral"
          icon={ListChecks}
          gradient="yellow"
          textColor="text-[#B46309]"
        />
        <StatCard
          title="AI Generate Limit"
          value={aiGenerateLimit === -1 ? "Unlimited" : aiGenerateLimit}
          change={aiGenerateLimit === -1 ? undefined : undefined}
          changeType="neutral"
          icon={Bot}
          gradient="yellow"
          textColor="text-[#B46309]"
        />
      </div>
    </div>
  );
}

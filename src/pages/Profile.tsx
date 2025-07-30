import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Loader2, Crown, ListChecks, Bot, Info } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import PlanCards from "../components/PlanCards";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionStart, setSubscriptionStart] = useState<Date | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);

  useEffect(() => {
    document.title = "DevTracker Pro | Profile";

    async function fetchUserDetails() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select(
          "subscription_plan, task_limit, ai_generate_limit, subscription_start, subscription_expire"
        )
        .eq("id", user.id)
        .single();

      if (!error && data) {
        // Check for expiration
        const now = new Date();
        const expireDate = data.subscription_expire
          ? new Date(data.subscription_expire)
          : null;
        if (
          data.subscription_plan !== "free" &&
          expireDate &&
          now > expireDate
        ) {
          // Downgrade user to free plan
          await supabase
            .from("users")
            .update({
              subscription_plan: "free",
              task_limit: 1,
              ai_generate_limit: 2,
              subscription_start: null,
              subscription_expire: null,
            })
            .eq("id", user.id);

          // Update local state to reflect downgrade
          setPlan("free");
          setSubscriptionStart(null);
          setSubscriptionEnd(null);
          setTaskLimit(1); // default free plan limits
          setAiGenerateLimit(2);
        } else {
          setPlan(data.subscription_plan || "free");
          setTaskLimit(data.task_limit ?? 0);
          setAiGenerateLimit(data.ai_generate_limit ?? 0);
          setSubscriptionStart(data.subscription_start || null);
          setSubscriptionEnd(data.subscription_expire || null);
        }
      }
      setLoading(false);
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
    <div className="flex flex-col items-center mt-5 mb-20">
      {/* Subscription Info Card */}
      {!loading && taskLimit !== -1 && (
        <div className="w-full mx-auto mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 border border-[#E9CCAC] rounded-lg p-3 gap-4">
            <div className="flex items-start gap-3">
              <div>
                <div className="font-meduim text-gray-900">
                  Unlock More with DevTracker{" "}
                  <span className="text-[#B46309]">PRO</span>
                </div>
                <div className="text-gray-600 text-sm">
                  Upgrade your plan to increase your daily task and AI
                  generation limits. Pro users enjoy more productivity and
                  flexibility every day!
                </div>
              </div>
            </div>
            <button
              className="bg-[#B46309] hover:bg-[#c77517] text-white font-medium px-3 py-1 text-sm rounded transition-all border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
              onClick={() => setOpenPlanDialog(true)}
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center w-full sm:px-4 md:px-8 lg:flex-row lg:items-start lg:justify-between lg:space-x-12 lg:space-y-0 space-y-8">
        {/* Main Profile Card - Responsive Glassmorphism Design */}
        {loading ? (
          <div className="w-full max-w-lg mx-auto">
            <Skeleton className="h-80 w-full mb-6" />
          </div>
        ) : (
          <Card className="bg-[#f6f4f0] p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center w-full mx-auto animate-fade-in">
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
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="w-full bg-[#b46309] text-white py-2 rounded-xl font-medium text-md transition-all duration-150 disabled:opacity-70 flex items-center justify-center gap-2 border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
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
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-[#E4D9BC] text-gray-800 hover:bg-amber-700/50 transition text-md font-medium border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                  onClick={() => supabase.auth.signOut()}
                >
                  Logout
                </button>
              </div>

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
        )}

        {/* Stats Grid - Redesigned to match Dashboard Stat Cards */}
        <div className="w-full mx-auto grid grid-cols-1  gap-6 sm:gap-8 animate-fade-in">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            <>
              <StatCard
                title="Current Plan"
                value={plan.charAt(0).toUpperCase() + plan.slice(1)}
                change={
                  !subscriptionStart && !subscriptionEnd
                    ? "No subscription"
                    : `Coverage period: ${new Date(
                        subscriptionStart
                      ).toLocaleDateString()} - ${new Date(
                        subscriptionEnd
                      ).toLocaleDateString()}`
                }
                changeType="neutral"
                icon={Crown}
                gradient="red"
                textColor="text-[#B46309] font-medium"
              />
              <StatCard
                title="Task Limit / Day"
                value={taskLimit === -1 ? "Unlimited" : taskLimit}
                change={taskLimit === -1 ? undefined : undefined}
                changeType="neutral"
                icon={ListChecks}
                gradient="yellow"
                textColor="text-[#B46309] font-medium"
              />
              <StatCard
                title="AI Generate Limit / Day"
                value={aiGenerateLimit === -1 ? "Unlimited" : aiGenerateLimit}
                change={aiGenerateLimit === -1 ? undefined : undefined}
                changeType="neutral"
                icon={Bot}
                gradient="yellow"
                textColor="text-[#B46309] font-medium"
              />
            </>
          )}
        </div>
        <Dialog open={openPlanDialog} onOpenChange={setOpenPlanDialog}>
          <DialogTrigger asChild>
            <button className="hidden" />
          </DialogTrigger>
          <DialogContent className="max-w-full bg-transparent border-none shadow-none z-[100] flex items-center justify-center min-h-screen h-screen overflow-y-hidden">
            <PlanCards user={{ ...user, subscription_plan: plan }} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Loader2 } from "lucide-react";
const plans = [
  {
    name: "Free",
    price: "$0.00",
    period: "/ month",
    label: "Free Plan",
    labelColor: "bg-gray-200 text-gray-700",
    features: [
      "Create only one task per day",
      "AI generate Tag and Steps 2 times per day",
    ],
    button: "Free Plan",
    buttonStyle: "bg-gray-200 text-gray-700 cursor-default",
    note: "Free plan limited to only one tasks and 2 times AI generations per day.",
    highlight: "free",
    current: true,
  },
  {
    name: "Premium",
    price: "$0.99",
    period: "/ month",
    label: "Most Popular",
    labelColor: "bg-green-100 text-green-600",
    features: [
      "Create up to 5 tasks/day",
      "AI generate Tag and Steps 15 times/day",
    ],
    button: "Upgrade to Premium",
    buttonStyle:
      "bg-green-600 border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba] hover:bg-green-700 text-white font-medium",
    note: "Best for regular users who want more flexibility.",
    highlight: "premium",
    current: false,
    priceId: "price_1RisPvDI4t7lGIs7K0UBurks", // Replace with your actual Premium plan price ID
  },
  {
    name: "Elite",
    price: "$2.49",
    period: "/ month",
    label: "Unlimited",
    labelColor: "bg-orange-100 text-[#B46309]",
    features: [
      "Create tasks unlimited ",
      "AI generate Tag and Steps unlimited times",
      "Service support 8x5xNBD (Telegram or Email)",
    ],
    button: "Upgrade to Elite",
    buttonStyle:
      "bg-[#b46309] border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba] hover:bg-orange-600 text-white font-medium",
    note: "For power users who need maximum limits.",
    highlight: "elite",
    current: false,
    priceId: "price_1RisQDDI4t7lGIs7QkD5xFXQ", // Replace with your actual Elite plan price ID
  },
];

// Accept user as a prop for email and userId
export default function PlanCards({ user }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  // Determine current plan from user.subscription_plan
  const userPlan = (user?.subscription_plan || "free").toLowerCase().trim();
  // Debug: log userPlan and plan names
  console.log(
    "User subscription_plan:",
    user?.subscription_plan,
    "| userPlan:",
    userPlan
  );
  // Map plans to set current and button/label for the user's plan
  const displayPlans = plans.map((plan) => {
    const planName = plan.name.toLowerCase().trim();
    const isCurrent = planName === userPlan;
    if (isCurrent) {
      console.log("Current plan matched:", planName);
    }
    return {
      ...plan,
      current: isCurrent,
      button: isCurrent ? "Current plan" : plan.button,
      buttonStyle: isCurrent
        ? "bg-gray-200 text-gray-700 cursor-default"
        : plan.buttonStyle,
      label: isCurrent ? "Current plan" : plan.label,
      labelColor: isCurrent ? "bg-gray-200 text-gray-700" : plan.labelColor,
    };
  });
  // Function to handle upgrade
  const handleUpgrade = async (plan) => {
    if (!user || !plan.priceId) return;
    setLoadingPlan(plan.name);
    try {
      const response = await fetch(
        "https://uqrdslqypuzxqadkufov.functions.supabase.co/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: plan.priceId,
            email: user.email,
            userId: user.id,
          }),
        }
      );
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-start pt-2 px-1 md:py-10 md:pt-20 md:px-2 overflow-y-scroll hide-scrollbar">
      <div className="grid p-10 px-12 min-w-0 grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 w-full max-w-screen-xl sm:px-2">
        {displayPlans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`relative flex flex-col items-center min-w-0 rounded-2xl bg-white shadow-lg p-3 sm:p-5 w-full transition-all duration-300
              ${
                plan.highlight === "premium"
                  ? "border-[3px] border-green-300 scale-105 shadow-2xl z-10"
                  : "border border-gray-100 hover:shadow-2xl"
              }
            `}
            style={{ maxWidth: "100%" }}
          >
            {/* Label */}
            {plan.label && (
              <span
                className={`absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold shadow ${plan.labelColor}`}
              >
                {plan.label}
              </span>
            )}
            {/* Name & Price */}
            <div className="mb-6 text-center w-full">
              <span
                className={`
                  md:text-3xl text-2xl font-medium tracking-tight block mb-2
                  ${
                    plan.highlight === "premium"
                      ? "text-green-700 drop-shadow-sm"
                      : plan.highlight === "elite"
                      ? "text-[#b46309]"
                      : "text-gray-900"
                  }
                  ${
                    plan.highlight === "premium"
                      ? "underline underline-offset-2 decoration-green-600"
                      : ""
                  }
                `}
              >
                {plan.name}
              </span>
              <div className="flex items-end justify-center">
                <span
                  className={`
                  md:text-3xl text-2xl font-medium tracking-tight block
                  ${
                    plan.highlight === "premium"
                      ? "text-green-700 drop-shadow-sm"
                      : plan.highlight === "elite"
                      ? "text-[#b46309]"
                      : "text-gray-900"
                  }
                
                `}
                >
                  {plan.price}
                </span>
                <span className="text-lg text-gray-400 ml-1 mb-1">
                  {plan.period}
                </span>
              </div>
            </div>
            {/* Features */}
            <ul className="mb-6 w-full">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center mb-4 text-gray-700 text-base break-words w-full"
                >
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="leading-snug break-words w-full">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            {/* Button */}
            <button
              className={`w-full py-2 sm:py-3 rounded-xl text-base sm:text-lg transition-colors duration-200 mb-3 flex items-center justify-center gap-2 ${plan.buttonStyle}`}
              disabled={plan.current || loadingPlan === plan.name}
              onClick={() => handleUpgrade(plan)}
            >
              {loadingPlan === plan.name ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                plan.button
              )}
            </button>
            {/* Note */}
            <div className="text-xs text-gray-400 text-center min-h-[24px] break-words w-full">
              {plan.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

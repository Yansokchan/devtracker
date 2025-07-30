import { supabase } from "@/lib/supabaseClient";

export async function updateAiGenerateLimit(
  newLimit: number,
  setAiGenerateLimit: (n: number) => void
) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user for AI limit update:", userError);
      return false;
    }
    const { data, error: updateError } = await supabase
      .from("users")
      .update({ ai_generate_limit: newLimit })
      .eq("id", user.id)
      .select("ai_generate_limit");
    if (updateError) {
      console.error("Supabase update error:", updateError);
      return false;
    }
    if (data && data.length > 0) {
      setAiGenerateLimit(data[0].ai_generate_limit);
      return true;
    } else {
      setAiGenerateLimit(newLimit);
      return true;
    }
  } catch (err) {
    console.error("Exception in updateAiGenerateLimit:", err);
    return false;
  }
}

export async function updateTaskLimit(
  newLimit: number,
  setTaskLimit: (n: number) => void
) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user for task limit update:", userError);
      return false;
    }
    const { data, error: updateError } = await supabase
      .from("users")
      .update({ task_limit: newLimit })
      .eq("id", user.id)
      .select("task_limit");
    if (updateError) {
      console.error("Supabase update error:", updateError);
      return false;
    }
    if (data && data.length > 0) {
      setTaskLimit(data[0].task_limit);
      return true;
    } else {
      setTaskLimit(newLimit);
      return true;
    }
  } catch (err) {
    console.error("Exception in updateTaskLimit:", err);
    return false;
  }
}

export async function fetchLimits(
  setAiGenerateLimit: (n: number | null) => void,
  setTaskLimit: (n: number | null) => void,
  setAiLimitLoading: (b: boolean) => void,
  setTaskLimitLoading: (b: boolean) => void
) {
  setAiLimitLoading(true);
  setTaskLimitLoading(true);
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setAiGenerateLimit(null);
      setTaskLimit(null);
      setAiLimitLoading(false);
      setTaskLimitLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("ai_generate_limit, task_limit")
      .eq("id", user.id)
      .single();
    if (error) {
      setAiGenerateLimit(null);
      setTaskLimit(null);
    } else if (data) {
      setAiGenerateLimit(data.ai_generate_limit);
      setTaskLimit(data.task_limit);
    } else {
      setAiGenerateLimit(null);
      setTaskLimit(null);
    }
  } catch (err) {
    setAiGenerateLimit(null);
    setTaskLimit(null);
  } finally {
    setAiLimitLoading(false);
    setTaskLimitLoading(false);
  }
}

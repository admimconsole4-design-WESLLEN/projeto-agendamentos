import { supabase } from "@/integrations/supabase/client";

export const signUp = async (email: string, password: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("is_admin", {
    user_id: userId,
  });
  
  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
  
  return data === true;
};

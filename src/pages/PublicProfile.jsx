import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import BlueTheme from "../assets/Themes/BlueTheme";
import GreenProfile from "../assets/Themes/GreenProfile";
import DirectorProfileTheme from "../assets/Themes/DirectorProfileTheme";
import PinkBusinessCardTheme from "../assets/Themes/PinkBusinessCardTheme";
import BusinessTheme from "../assets/Themes/BusinessTheme";
import EngineerTheme from "../assets/Themes/EngineerTheme";
import TapinfiTheme from "../assets/Themes/TapinfiTheme";

const themeComponents = {
  "BlueTheme": BlueTheme,
  "GreenProfile": GreenProfile,
  "DirectorProfileTheme": DirectorProfileTheme,
  "PinkBusinessCardTheme": PinkBusinessCardTheme,
  "BusinessTheme": BusinessTheme,
  "EngineerTheme": EngineerTheme,
  "TapinfiTheme": TapinfiTheme
};

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [appliedThemeId, setAppliedThemeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileAndTheme = async () => {
      try {
        // 1. Fetch user profile
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select(
            `id, full_name, username, role, company, about, profile_pic_url, cover_pic_url,
             phone_number, user_email, website_url, portfolio_url, facebook_url, instagram_url,
             linkedin_url, twitter_url, whatsapp_url, publish,themeid, map_url, company_logo_url`
          )
          .eq("username", username)
          .single();

        if (profileError || !userProfile) throw new Error("Profile not found.");
        if (!userProfile.publish) throw new Error("This profile is not published yet.");

        setProfile(userProfile);

        // 2. Fetch applied theme
        const { data: userTheme, error: themeError } = await supabase
          .from("user_themes")
          .select("theme_id")
          .eq("user_id", userProfile.id)
          .eq("applied", true)
          .single();
        
        if (!themeError && userTheme) setAppliedThemeId(userProfile.themeid);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndTheme();
  }, [username]);

  if (loading)
    return <p className="text-center mt-10 text-xl text-blue-600 animate-pulse">Loading profile...</p>;

  if (error)
    return <p className="text-center mt-10 text-xl text-red-600">{error}</p>;

  // Determine which theme to render
  const SelectedTheme = appliedThemeId ? themeComponents[appliedThemeId] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {SelectedTheme ? (
        <SelectedTheme profile={profile} />
      ) : (
        <p className="text-center mt-10 text-xl text-gray-500">
          No theme applied for this profile.
        </p>
      )}
    </div>
  );
}

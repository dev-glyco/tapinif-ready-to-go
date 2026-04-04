import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

/*
  ProfileWizard.jsx
  - Step-by-step onboarding for Tapinfi profile editing
  - Sections: 1) Profile Images  2) Basic Details  3) Contact & Social  4) Preview & Save
  - Username & Full name locked after first save (enforced via is_username_locked column)
  - Strong validations for phone (E.164) and social URLs
  - Clean UI with Next / Previous, progress indicator, per-step validation

  Notes:
  - This file intentionally contains multiple small components for one-file preview. In a real project split them.
  - Tailwind classes are used for styling.
*/

/* --------------------
   Utilities: validators
   -------------------- */
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
 // E.164-ish validation (1 to 15 digits, optional +)
const URL_REGEX = /^(https?:)\/\/([\w.-]+)(:[0-9]+)?(\/.*)?$/i;
const SOCIAL_WHITELIST = [
  "linkedin.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "wa.me",
  "whatsapp.com",
];

function validateSocialUrl(url) {
  if (!url) return true; // optional field
  if (!URL_REGEX.test(url)) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return SOCIAL_WHITELIST.some((domain) => host.endsWith(domain));
  } catch (e) {
    return false;
  }
}

function validatePhone(phone) {
  if (!phone) return true; // optional
  const cleaned = phone.trim();
  return PHONE_REGEX.test(cleaned);
}

/* --------------------
   Small UI primitives
   -------------------- */
const Field = ({ label, children, error }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const TextInput = ({ value, onChange, placeholder = "", readOnly = false }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    readOnly={readOnly}
    className={`w-full p-3 border rounded-lg transition duration-150 ease-in-out ${
      readOnly ? "bg-gray-100 border-gray-300" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }`}
  />
);

/* --------------------
   ImageUploader (with preview + progress)
   -------------------- */
function ImageUploader({ label, currentUrl, onUpload, accept = "image/*", maxSizeMB = 0.5, maxDim = 800 }) {
  const [preview, setPreview] = useState(currentUrl || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => setPreview(currentUrl || ""), [currentUrl]);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const options = { maxSizeMB, maxWidthOrHeight: maxDim, useWebWorker: true, fileType: "image/webp" };
      const compressed = await imageCompression(file, options);
      // create a local preview immediately
      const localUrl = URL.createObjectURL(compressed);
      setPreview(localUrl);
      await onUpload(compressed);
    } catch (e) {
      alert("Image upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-gray-400">No image</div>
          )}
        </div>
        <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-white border rounded shadow-sm text-sm text-blue-600 hover:bg-blue-50">
          {uploading ? "Uploading..." : "Change"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
}

/* --------------------
   Step components
   -------------------- */
function StepImages({ profile, onUploadProfile, onUploadCover, onUploadCompanyLogo }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Profile Pictures</h3>

      <ImageUploader
        label="Profile Photo"
        currentUrl={profile.profile_pic_url}
        onUpload={onUploadProfile}
        maxSizeMB={0.5}
        maxDim={800}
      />

      <ImageUploader
        label="Cover Photo"
        currentUrl={profile.cover_pic_url}
        onUpload={onUploadCover}
        maxSizeMB={1}
        maxDim={1600}
      />

      {/* NEW COMPANY LOGO */}
      <ImageUploader
        label="Company Logo"
        currentUrl={profile.company_logo_url}
        onUpload={onUploadCompanyLogo}
        maxSizeMB={0.5}
        maxDim={500}
      />
    </div>
  );
}

function StepBasic({ profile, setProfile, errors, readOnlyUsername }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Basic Details</h3>
      <Field label="Username" error={errors.username}>
        <TextInput
          value={profile.username || ""}
          onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value.replace(/\s+/g, "") }))}
          placeholder="unique_id"
          readOnly={readOnlyUsername}
        />
      </Field>

      <Field label="Full Name" error={errors.full_name}>
        <TextInput
          value={profile.full_name || ""}
          onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
          placeholder="Your full name"
          
        />
      </Field>

      <Field label="Company Name / Company Details" error={errors.company}>
        <textarea value={profile.company || ""} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} placeholder="Company" className="w-full p-3 border rounded-lg" rows={4}/>
      </Field>

      <Field label="Role / Title" error={errors.role}>
        <TextInput value={profile.role || ""} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))} placeholder="Founder / CEO" />
      </Field>

      <Field label="About">
        <textarea value={profile.about || ""} onChange={(e) => setProfile((p) => ({ ...p, about: e.target.value }))} className="w-full p-3 border rounded-lg" rows={4} />
      </Field>
    </div>
  );
}

function StepContact({ profile, setProfile, errors }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Contact & Social</h3>

      <Field label="Email">
        <TextInput value={profile.user_email || ""} readOnly />
      </Field>

      <Field label="Phone Number" error={errors.phone_number}>
        <TextInput
          value={profile.phone_number || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, phone_number: e.target.value }))
          }
          placeholder="+919876543210"
        />
      </Field>

      <Field label="Website" error={errors.website_url}>
        <TextInput
          value={profile.website_url || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, website_url: e.target.value }))
          }
          placeholder="https://yourcompany.com"
        />
      </Field>

      {/* ✅ NEW — Portfolio URL field */}
      <Field label="Docs URL ( Company Brochure or Catalog)">
        <TextInput
          value={profile.portfolio_url || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, portfolio_url: e.target.value }))
          }
          placeholder="https://yourportfolio.com / Google Drive PDF"
        />
      </Field>

      <Field label="Company Location (Google Maps Link)">
        <TextInput
          value={profile.map_url || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, map_url: e.target.value }))
          }
          placeholder="https://maps.google.com/..."
        />
      </Field>
      {/* END NEW */}

      <Field label="LinkedIn" error={errors.linkedin_url}>
        <TextInput
          value={profile.linkedin_url || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, linkedin_url: e.target.value }))
          }
          placeholder="https://linkedin.com/in/yourname"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Instagram" error={errors.instagram_url}>
          <TextInput
            value={profile.instagram_url || ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, instagram_url: e.target.value }))
            }
            placeholder="https://instagram.com/yourhandle"
          />
        </Field>

        <Field label="X / Twitter" error={errors.twitter_url}>
          <TextInput
            value={profile.twitter_url || ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, twitter_url: e.target.value }))
            }
            placeholder="https://x.com/yourhandle"
          />
        </Field>
      </div>

      <Field label="Facebook" error={errors.facebook_url}>
        <TextInput
          value={profile.facebook_url || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, facebook_url: e.target.value }))
          }
          placeholder="https://facebook.com/yourpage"
        />
      </Field>

      <Field label="WhatsApp Link" error={errors.whatsapp_url}>
        <TextInput
          value={profile.whatsapp_url || ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, whatsapp_url: e.target.value }))
          }
          placeholder="https://wa.me/919876543210"
        />
      </Field>
    </div>
  );
}


function StepPreview({ profile }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-3">Preview</h3>

      {/* COVER IMAGE */}
      <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
        {profile.cover_pic_url ? (
          <img
            src={profile.cover_pic_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No cover photo
          </div>
        )}
      </div>

      {/* PROFILE SECTION */}
      <div className="border rounded-xl p-5 bg-white shadow-sm">
        <div className="flex items-center space-x-4 border-b pb-4">
          <img
            src={profile.profile_pic_url || "https://via.placeholder.com/80"}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <div className="text-xl font-bold text-gray-800">{profile.full_name}</div>
            <div className="text-sm text-gray-600">@{profile.username}</div>
            <div className="text-sm text-gray-700 mt-1">
              {profile.role} {profile.company && <>— {profile.company}</>}
            </div>
          </div>
        </div>

        {/* ABOUT */}
        {profile.about && (
          <p className="mt-4 text-gray-700 leading-relaxed">{profile.about}</p>
        )}

        {/* CONTACT INFO */}
        <div className="mt-6 text-sm text-gray-700 space-y-2">
          {profile.user_email && (
            <div className="flex items-center">
              <span className="font-medium w-28 text-gray-500">Email:</span>
              <a
                href={`mailto:${profile.user_email}`}
                className="text-blue-600 hover:underline break-all"
              >
                {profile.user_email}
              </a>
            </div>
          )}

          {profile.phone_number && (
            <div className="flex items-center">
              <span className="font-medium w-28 text-gray-500">Phone:</span>
              <a
                href={`tel:${profile.phone_number}`}
                className="text-blue-600 hover:underline"
              >
                {profile.phone_number}
              </a>
            </div>
          )}

          {profile.whatsapp_url && (
            <div className="flex items-center">
              <span className="font-medium w-28 text-gray-500">WhatsApp:</span>
              <a
                href={profile.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {profile.whatsapp_url}
              </a>
            </div>
          )}

          {profile.website_url && (
            <div className="flex items-center">
              <span className="font-medium w-28 text-gray-500">Website:</span>
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {profile.website_url}
              </a>
            </div>
          )}
        </div>

        {/* SOCIAL LINKS */}
        <div className="mt-6 text-sm text-gray-700 space-y-1">
          {profile.linkedin_url && (
            <div>
              <span className="font-medium text-gray-500">LinkedIn:</span>{" "}
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {profile.linkedin_url}
              </a>
            </div>
          )}
          {profile.instagram_url && (
            <div>
              <span className="font-medium text-gray-500">Instagram:</span>{" "}
              <a
                href={profile.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {profile.instagram_url}
              </a>
            </div>
          )}
          {profile.twitter_url && (
            <div>
              <span className="font-medium text-gray-500">X/Twitter:</span>{" "}
              <a
                href={profile.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {profile.twitter_url}
              </a>
            </div>
          )}
          {profile.facebook_url && (
            <div>
              <span className="font-medium text-gray-500">Facebook:</span>{" "}
              <a
                href={profile.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {profile.facebook_url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




/* --------------------
   Main Wizard
   -------------------- */
export default function ProfileWizard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const steps = ["Images", "Basic", "Contact", "Preview"];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        navigate("/");
        return;
      }
      setUser(authData.user);

      const { data: userData } = await supabase.from("users").select("*").eq("id", authData.user.id).single();
      if (!userData) {
        await supabase.from("users").upsert({ id: authData.user.id, user_email: authData.user.email });
        setProfile({ user_email: authData.user.email });
      } else {
        // normalize keys for this component
        setProfile({ ...userData, user_email: authData.user.email });
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  /* ----------
     Image upload handlers
  ---------- */
const uploadImageToStorage = async (file, type) => {
  if (!user) throw new Error("No user");

  const timestamp = Date.now();

  let filePath = "";
  let columnKey = "";

  if (type === "profile") {
    filePath = `profile_${user.id}_${timestamp}.webp`;
    columnKey = "profile_pic_url";
  }

  if (type === "cover") {
    filePath = `cover_${user.id}_${timestamp}.webp`;
    columnKey = "cover_pic_url";
  }

  if (type === "company") {
    filePath = `company_${user.id}_${timestamp}.webp`; // ✅ PREFIX
    columnKey = "company_logo_url";
  }

  // delete old
  const oldUrl = profile[columnKey];
  if (oldUrl) {
    try {
      const oldFile = oldUrl.split("/").pop().split("?")[0];
      await supabase.storage.from("profile_pics").remove([oldFile]);
    } catch {}
  }

  const { error } = await supabase.storage
    .from("profile_pics")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("profile_pics")
    .getPublicUrl(filePath);

  const imageUrl = `${data.publicUrl}?t=${timestamp}`;

  await supabase.from("users").upsert({
    id: user.id,
    [columnKey]: imageUrl,
  });

  setProfile((p) => ({ ...p, [columnKey]: imageUrl }));
};

  /* ----------
     Validation per-step
  ---------- */
  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 1) {
      // Basic
      if (!profile.username) newErrors.username = "Username is required.";
      if (/\s/.test(profile.username || "")) newErrors.username = "Username cannot contain spaces.";
      if (!profile.full_name) newErrors.full_name = "Full name is required.";
      if (!profile.company) newErrors.company = "Company is required.";
      if (!profile.role) newErrors.role = "Role / title is required.";
    }

    if (stepIndex === 2) {
      // Contact
      if (profile.phone_number && !validatePhone(profile.phone_number)) newErrors.phone_number = "Enter a valid phone in international format (e.g. +919876543210).";
      if (profile.website_url && !URL_REGEX.test(profile.website_url)) newErrors.website_url = "Enter a valid website URL starting with https://";
      if (profile.linkedin_url && !validateSocialUrl(profile.linkedin_url)) newErrors.linkedin_url = "Enter a valid LinkedIn URL.";
      if (profile.instagram_url && !validateSocialUrl(profile.instagram_url)) newErrors.instagram_url = "Enter a valid Instagram URL.";
      if (profile.twitter_url && !validateSocialUrl(profile.twitter_url)) newErrors.twitter_url = "Enter a valid X/Twitter URL.";
      if (profile.facebook_url && !validateSocialUrl(profile.facebook_url)) newErrors.facebook_url = "Enter a valid Facebook URL.";
      if (profile.whatsapp_url && !validateSocialUrl(profile.whatsapp_url)) newErrors.whatsapp_url = "Enter a valid WhatsApp link (wa.me or whatsapp.com).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = async () => {
    const valid = validateStep(step);
    if (!valid) return;

    // special action when leaving Basic step: ensure uniqueness & lock logic
    if (step === 1) {
      // check username uniqueness
      try {
        const { data: existing } = await supabase.from("users").select("id").eq("username", profile.username).neq("id", user.id).maybeSingle();
        if (existing) {
          setErrors({ username: "This username is already taken." });
          return;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  /* ----------
     Save final profile
  ---------- */
  const handleSave = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      // ensure all required steps valid
      setStep(1);
      return;
    }

    setIsSaving(true);
    try {
      const update = {
        id: user.id,
        user_email: user.email,
        full_name: profile.full_name,
        role: profile.role,
        company: profile.company,
        about: profile.about,
        phone_number: profile.phone_number,
        website_url: profile.website_url,
        portfolio_url: profile.portfolio_url,
        facebook_url: profile.facebook_url,
        instagram_url: profile.instagram_url,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
        whatsapp_url: profile.whatsapp_url,
        username: profile.username,
        // lock username & fullname so app cannot change them anymore
        is_username_locked: true,
        is_fullname_locked: false,
        map_url: profile.map_url,
        company_logo_url: profile.company_logo_url,
      };

      const { error } = await supabase.from("users").upsert(update);
      if (error) throw error;

      setProfile((p) => ({ ...p, is_username_locked: true}));
      alert("Profile saved successfully!");
    } catch (e) {
      alert("Failed to save: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-xl font-semibold text-blue-600">Loading profile...</p>;

  const readOnlyUsername = !!profile.is_username_locked;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-start justify-center">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>

        {/* progress */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2">Step {step + 1} of {steps.length}: {steps[step]}</div>
          <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
            <div className="h-2 bg-blue-600" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-6">
         {step === 0 && (
            <StepImages
              profile={profile}
              onUploadProfile={(file) => uploadImageToStorage(file, "profile")}
              onUploadCover={(file) => uploadImageToStorage(file, "cover")}
              onUploadCompanyLogo={(file) => uploadImageToStorage(file, "company")}
            />
          )}
          {step === 1 && <StepBasic profile={profile} setProfile={setProfile} errors={errors} readOnlyUsername={readOnlyUsername} />}
          {step === 2 && <StepContact profile={profile} setProfile={setProfile} errors={errors} />}
          {step === 3 && <StepPreview profile={profile} />}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div>
            <button onClick={goPrev} disabled={step === 0} className={`px-4 py-2 rounded-lg mr-2 ${step === 0 ? "bg-gray-100 text-gray-400" : "bg-white border shadow-sm"}`}>
              Previous
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {step < steps.length - 1 ? (
              <button onClick={goNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Next</button>
            ) : (
              <button onClick={handleSave} disabled={isSaving} className={`px-4 py-2 rounded-lg font-semibold ${isSaving ? "bg-blue-300 text-white" : "bg-green-600 text-white hover:bg-green-700"}`}>
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            )}

            {/* <button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              Logout
            </button> */}
          </div>
        </div>

        {/* inline validation summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded text-sm">
            {Object.values(errors).map((err, i) => (<div key={i}>• {err}</div>))}
          </div>
        )}
      </div>
    </div>
  );
}

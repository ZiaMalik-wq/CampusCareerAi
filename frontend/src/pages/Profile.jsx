import React, { useState, useEffect, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  User,
  Upload,
  FileText,
  Save,
  CheckCircle,
  Eye,
  Building2,
  MapPin,
  Globe,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const Profile = () => {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [_resumeLoading, setResumeLoading] = useState(false);

  const [studentData, setStudentData] = useState({
    full_name: "",
    university: "",
    cgpa: "",
    city: "",
    skills: "",
  });

  const [companyData, setCompanyData] = useState({
    company_name: "",
    location: "",
    website: "",
  });

  const [initialStudentData, setInitialStudentData] = useState(null);
  const [initialCompanyData, setInitialCompanyData] = useState(null);

  const [_resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);

  const roleKey = useMemo(() => {
    if (!user?.role) return "";
    const raw = String(user.role);
    // Handles "COMPANY" as well as "UserRole.COMPANY" or other enum string formats
    return raw.split(".").pop().toLowerCase();
  }, [user?.role]);

  const isStudent = roleKey === "student";
  const isCompany = roleKey === "company";

  const studentDirty = useMemo(
    () => JSON.stringify(studentData) !== JSON.stringify(initialStudentData),
    [studentData, initialStudentData]
  );

  const companyDirty = useMemo(
    () => JSON.stringify(companyData) !== JSON.stringify(initialCompanyData),
    [companyData, initialCompanyData]
  );

  useEffect(() => {
    if (!user) return;

    // Prefill from /auth/me display name so the form isn't blank while profile loads.
    if (isStudent && user.full_name && !studentData.full_name) {
      setStudentData((prev) => ({ ...prev, full_name: user.full_name }));
    }
    if (isCompany && user.full_name && !companyData.company_name) {
      setCompanyData((prev) => ({ ...prev, company_name: user.full_name }));
    }

    const load = async () => {
      setProfileLoading(true);
      try {
        if (isStudent) {
          const res = await api.get("/students/profile");
          const data = {
            ...res.data,
            skills: Array.isArray(res.data.skills)
              ? res.data.skills.join(", ")
              : res.data.skills || "",
          };
          setStudentData(data);
          setInitialStudentData(data);
          setExistingResume(
            res.data.resume_url || res.data.resume_filename || null
          );

          if (!initialStudentData) setInitialStudentData(data);
        }

        if (isCompany) {
          const res = await api.get("/companies/profile");
          setCompanyData(res.data);
          setInitialCompanyData(res.data);

          if (!initialCompanyData) setInitialCompanyData(res.data);
        }
      } catch (err) {
        const message = err?.response?.data?.detail || "Failed to load profile";
        toast.error(message);
      } finally {
        setProfileLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isStudent, isCompany]);

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const handleStudentChange = (e) =>
    setStudentData({ ...studentData, [e.target.name]: e.target.value });

  const handleCompanyChange = (e) =>
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });

  const handleStudentSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const t = toast.loading("Saving profile...");
    try {
      await api.put("/students/profile", {
        ...studentData,
        cgpa: studentData.cgpa ? parseFloat(studentData.cgpa) : null,
      });
      toast.success("Profile updated", { id: t });
      setInitialStudentData(studentData);
    } catch {
      toast.error("Failed to save profile", { id: t });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const t = toast.loading("Saving company profile...");
    try {
      await api.put("/companies/profile", companyData);
      toast.success("Company profile updated", { id: t });
      setInitialCompanyData(companyData);
    } catch {
      toast.error("Failed to save profile", { id: t });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files allowed");
      return;
    }

    setResumeLoading(true);
    const t = toast.loading("Uploading resume...");
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await api.post("/students/resume", data);
      toast.success("Resume uploaded", { id: t });
      setResumeFile(file);
      setExistingResume(res.data.resume_url);
    } catch {
      toast.error("Upload failed", { id: t });
    } finally {
      setResumeLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center gap-4"
        >
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
            {isCompany ? (
              <Building2 className="w-7 h-7 text-white" />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isCompany ? "Company Profile" : "My Profile"}
            </h1>
            <p className="text-gray-600">
              {isCompany
                ? "What students will see about your company"
                : "Your information used for job matching"}
            </p>
          </div>
        </motion.header>

        {/* ------------------ STUDENT ------------------ */}
        {isStudent && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <motion.form
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              onSubmit={handleStudentSave}
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow border space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-800">
                Personal Information
              </h2>

              <input
                name="full_name"
                value={studentData.full_name}
                onChange={handleStudentChange}
                placeholder="Full Name"
                className="input"
              />

              <h3 className="text-sm font-semibold text-gray-600">Education</h3>

              <input
                name="university"
                value={studentData.university}
                onChange={handleStudentChange}
                placeholder="University"
                className="input"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="city"
                  value={studentData.city}
                  onChange={handleStudentChange}
                  placeholder="City"
                  className="input"
                />
                <input
                  name="cgpa"
                  value={studentData.cgpa}
                  onChange={handleStudentChange}
                  placeholder="CGPA"
                  className="input"
                />
              </div>

              <h3 className="text-sm font-semibold text-gray-600">Skills</h3>

              <input
                name="skills"
                value={studentData.skills}
                onChange={handleStudentChange}
                placeholder="Python, React, SQL"
                className="input"
              />

              <button
                disabled={!studentDirty || loading}
                className="btn-primary disabled:opacity-40"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </motion.form>

            {/* Resume */}
            <motion.section
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-3xl p-8 shadow border"
            >
              <h2 className="text-xl font-bold mb-4">Resume</h2>

              <label
                htmlFor="resume-upload"
                className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 focus-within:ring-2"
              >
                <Upload className="mx-auto w-8 h-8 text-gray-400" />
                <span className="block mt-2 font-semibold">
                  Upload PDF Resume
                </span>
                <input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="sr-only"
                />
              </label>

              {existingResume && (
                <a
                  href={existingResume}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                  View current resume
                </a>
              )}
            </motion.section>
          </div>
        )}

        {/* ------------------ COMPANY ------------------ */}
        {isCompany && (
          <motion.form
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onSubmit={handleCompanySave}
            className="bg-white rounded-3xl p-8 shadow border space-y-6 max-w-3xl"
          >
            <h2 className="text-xl font-bold">Company Information</h2>

            <input
              name="company_name"
              value={companyData.company_name}
              onChange={handleCompanyChange}
              placeholder="Company Name"
              className="input"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="location"
                value={companyData.location}
                onChange={handleCompanyChange}
                placeholder="Location"
                className="input"
              />
              <input
                name="website"
                value={companyData.website}
                onChange={handleCompanyChange}
                placeholder="Website"
                className="input"
              />
            </div>

            {/* Preview */}
            <div className="bg-blue-50 p-4 rounded-xl border">
              <p className="text-xs font-semibold text-blue-700 mb-1">
                Student Preview
              </p>
              <p className="font-bold">{companyData.company_name}</p>
              <p className="text-sm text-gray-600">
                {companyData.location || "Location not specified"}
              </p>
            </div>

            <button
              disabled={!companyDirty || loading}
              className="btn-primary disabled:opacity-40"
            >
              <Save className="w-5 h-5" />
              Save Company Profile
            </button>
          </motion.form>
        )}
      </div>
    </main>
  );
};

export default Profile;

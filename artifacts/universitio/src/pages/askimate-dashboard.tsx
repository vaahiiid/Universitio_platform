import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileUp, MessageSquare, Settings, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";

function AskiMateDashboardContent() {
  const { user, logout } = useAskiMateAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "documents" | "chat" | "subscription">("profile");
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    dateOfBirth: user?.dateOfBirth || "",
    termsAccepted: user?.termsAccepted || true,
    privacyAccepted: user?.privacyAccepted || true,
    marketingConsent: user?.marketingConsent || false,
  });

  const [documents, setDocuments] = useState([
    { id: 1, name: "Personal Statement.pdf", uploadedAt: "2025-03-20", size: "245 KB" },
    { id: 2, name: "CV.docx", uploadedAt: "2025-03-18", size: "180 KB" },
  ]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleProfileChange = (field: string, value: unknown) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setLocation("/askimate");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    setUpdateError("");
    setUpdateSuccess(false);
    try {
      // Profile save is ready for Phase 3 when updateProfile is connected
      console.log("Profile saved:", profileData);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Dashboard — AskiMate AI</title>
        <meta name="description" content="Your AskiMate profile and mentoring dashboard." />
      </Helmet>
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border/60 p-6 sticky top-32">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {profileData.firstName[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profileData.firstName} {profileData.lastName}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: Settings },
                  { id: "documents", label: "Documents", icon: FileUp },
                  { id: "chat", label: "Messages", icon: MessageSquare },
                  { id: "subscription", label: "Subscription", icon: FileUp },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-6 border-t border-border pt-6 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-border/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileData.mobile}
                      onChange={(e) => handleProfileChange("mobile", e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Consent</h3>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.termsAccepted}
                        onChange={(e) => handleProfileChange("termsAccepted", e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree to the Terms & Conditions
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.privacyAccepted}
                        onChange={(e) => handleProfileChange("privacyAccepted", e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree to the Privacy Policy
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.marketingConsent}
                        onChange={(e) => handleProfileChange("marketingConsent", e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        Send me tips, updates, and promotional offers
                      </span>
                    </label>
                  </div>

                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Save Changes
                  </Button>
                </form>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="bg-white rounded-xl border border-border/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Documents</h2>

                <div className="mb-8 p-6 border-2 border-dashed border-border/60 rounded-lg text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <FileUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground mb-1">Drop files to upload</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, DOCX</p>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {doc.uploadedAt} • {doc.size}
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Free plan: up to 3 documents. Premium: unlimited uploads.
                </p>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="bg-white rounded-xl border border-border/60 p-8 h-[600px] flex flex-col">
                <h2 className="text-2xl font-bold text-foreground mb-6">Messages</h2>

                <div className="flex-1 flex flex-col items-center justify-center text-center mb-6">
                  <MessageSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Your mentor will reply here</p>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type your message or question..."
                    className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Button className="bg-primary hover:bg-primary/90 text-white">Send</Button>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div className="bg-white rounded-xl border border-border/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Subscription</h2>

                <div className="p-6 bg-muted/30 rounded-lg mb-6 border border-border/40">
                  <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
                  <p className="text-2xl font-bold text-foreground mb-4">Free Plan</p>
                  <p className="text-sm text-muted-foreground mb-4">5 questions per week • Response within 24–48 hours</p>
                  <Button variant="outline">View All Plans</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Usage This Week</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">Questions Remaining</p>
                        <p className="text-sm font-medium text-foreground">3 / 5</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get priority support, real-time chat, and full document reviews.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    View Premium Plans
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AskiMateDashboard() {
  return (
    <ProtectedRoute>
      <AskiMateDashboardContent />
    </ProtectedRoute>
  );
}

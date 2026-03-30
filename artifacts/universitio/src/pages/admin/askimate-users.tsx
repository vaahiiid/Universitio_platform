import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, Download, MessageSquare, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AskiMateUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: "Free" | "Premium";
  joinedDate: string;
  status: "Active" | "Inactive";
  questionsAsked: number;
  documents: number;
}

const mockUsers: AskiMateUser[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@example.com",
    plan: "Premium",
    joinedDate: "2025-03-15",
    status: "Active",
    questionsAsked: 12,
    documents: 3,
  },
  {
    id: 2,
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@example.com",
    plan: "Free",
    joinedDate: "2025-03-10",
    status: "Active",
    questionsAsked: 5,
    documents: 2,
  },
  {
    id: 3,
    firstName: "Emma",
    lastName: "Williams",
    email: "emma.w@example.com",
    plan: "Premium",
    joinedDate: "2025-02-28",
    status: "Inactive",
    questionsAsked: 8,
    documents: 1,
  },
];

function UserListRow({ user, onSelect }: { user: AskiMateUser; onSelect: (user: AskiMateUser) => void }) {
  return (
    <button
      onClick={() => onSelect(user)}
      className="w-full border-b border-border/40 hover:bg-muted/30 transition-colors p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              user.plan === "Premium"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {user.plan}
            </span>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground">{user.questionsAsked} questions</p>
            <p className="text-xs text-muted-foreground">{user.documents} documents</p>
          </div>
          <div className={`text-sm font-medium ${
            user.status === "Active" ? "text-green-600" : "text-muted-foreground"
          }`}>
            {user.status}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}

function UserDetailView({ user, onBack }: { user: AskiMateUser; onBack: () => void }) {
  const [replyMessage, setReplyMessage] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <button
          onClick={onBack}
          className="text-primary hover:underline font-medium text-sm mb-4"
        >
          ← Back to Users
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border/60 p-8">
        {/* Profile Section */}
        <div className="flex items-start gap-6 mb-8 pb-8 border-b border-border/40">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold text-primary">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {user.firstName} {user.lastName}
            </h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Email: {user.email}</p>
              <p>Plan: <span className={`font-medium ${user.plan === "Premium" ? "text-primary" : ""}`}>{user.plan}</span></p>
              <p>Status: <span className={`font-medium ${user.status === "Active" ? "text-green-600" : ""}`}>{user.status}</span></p>
              <p>Joined: {user.joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-border/40">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Questions Asked</p>
            <p className="text-3xl font-bold text-foreground">{user.questionsAsked}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Documents Uploaded</p>
            <p className="text-3xl font-bold text-foreground">{user.documents}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Last Activity</p>
            <p className="text-sm font-medium text-foreground">2 hours ago</p>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mb-8 pb-8 border-b border-border/40">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Uploaded Documents
          </h3>
          <div className="space-y-3">
            {[
              { name: "Personal Statement.pdf", size: "245 KB", date: "2025-03-20" },
              { name: "CV.docx", size: "180 KB", date: "2025-03-18" },
              { name: "Academic Transcript.pdf", size: "520 KB", date: "2025-03-15" },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.size} • {doc.date}</p>
                </div>
                <Button size="sm" variant="outline">Download</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat History Section */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat History
          </h3>

          <div className="space-y-4 bg-muted/10 p-4 rounded-lg h-96 overflow-y-auto mb-4">
            {[
              {
                type: "user",
                message: "What universities would be best for my profile?",
                time: "2025-03-20 10:30 AM",
              },
              {
                type: "admin",
                message: "Based on your profile, I'd recommend looking at Russell Group universities. Can you tell me more about your academic performance?",
                time: "2025-03-20 11:15 AM",
              },
              {
                type: "user",
                message: "I got AAA in A-levels and 7.5 IELTS",
                time: "2025-03-20 11:45 AM",
              },
              {
                type: "admin",
                message: "Excellent results! You're competitive for top UK universities. Let's discuss your preferred fields of study.",
                time: "2025-03-20 01:30 PM",
              },
            ].map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs ${
                    msg.type === "user"
                      ? "bg-primary text-white rounded-lg rounded-tr-none"
                      : "bg-white border border-border/40 rounded-lg rounded-tl-none"
                  } p-3`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-2 ${
                    msg.type === "user" ? "text-white/70" : "text-muted-foreground"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="flex gap-3">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <Button className="bg-primary hover:bg-primary/90 text-white self-end">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AskiMateUsersAdmin() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AskiMateUser | null>(null);
  const [users] = useState<AskiMateUser[]>(mockUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>AskiMate Users — Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AskiMate AI Users</h1>
            <p className="text-muted-foreground mt-1">{users.length} users total</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {selectedUser ? (
          <UserDetailView
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <>
            {/* Search */}
            <div className="bg-white rounded-xl border border-border/60 p-4">
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-border/60 overflow-hidden">
              {filteredUsers.length > 0 ? (
                <div>
                  {filteredUsers.map((user) => (
                    <UserListRow
                      key={user.id}
                      user={user}
                      onSelect={setSelectedUser}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

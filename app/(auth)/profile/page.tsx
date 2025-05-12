"use client";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Bot {
  id: string;
  botName: string;
  description: string;
  category: string;
  demoVideoLink: string | null;
  botImage: string | null;
  qrCodeImage: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface BotsResponse {
  bots: Bot[];
}

interface UserFormData {
  name: string;
  email: string;
  company: string;
  image?: File | null;
}


function BotCard({ bot, onDelete }: { bot: Bot; onDelete: (id: string) => void }) {

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        {bot.botImage && (
          <img
            src={bot.botImage}
            alt={`${bot.botName} QR Code`}
            className="w-12 h-12 object-cover rounded-full"
          />
        )}
        <h3 className="text-lg font-semibold text-gray-900">{bot.botName}</h3>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{bot.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {bot.category}
        </span>
        {bot.qrCodeImage && (
          <img
            src={bot.qrCodeImage}
            alt={`${bot.botName} QR Code`}
            className="w-12 h-12 object-cover"
          />
        )}
      </div>
      <div className="flex justify-between items-center">
        <Button className="text-xs px-3 py-1">
          Update
        </Button>
        <Button className="text-xs px-3 py-1" onClick={() => onDelete(bot.id)}> Delete</Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: userSession, status, update } = useSession();
  const router = useRouter();
  const [botsData, setBotsData] = useState<BotsResponse>({
    bots: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: userSession?.user?.name || "",
    email: userSession?.user?.email || "",
    company: userSession?.user?.company || "",
    image: null,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setFormData({
      name: userSession?.user?.name || "",
      email: userSession?.user?.email || "",
      company: userSession?.user?.company || "",
      image: null,
    });
  }, [userSession]);


  async function fetchBots() {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/test`);
      if (!response.ok) {
        throw new Error("Failed to fetch bots");
      }
      const data: BotsResponse = await response.json();
      setBotsData(data);
    } catch (err) {
      setError("Error loading bots. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBot(botId: string) {
    if (!confirm("Are you sure you want to delete this bot?")) return;

    try {
      const response = await fetch("/api/test", {
        method: "DELETE",
        body: JSON.stringify({ botId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete bot");
      }
      await fetchBots();
    } catch (error) {
      console.error("Error deleting bot:", error);
    }
  }

  async function deleteAccount() {
    if (!userSession?.user?.id) return;
    if (!confirm("Are you sure you want to delete your account and all associated bots?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await signOut({ callbackUrl: "/login" });
      router.push("/home");
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (
      formData.name === (userSession?.user?.name || "") &&
      formData.email === (userSession?.user?.email || "") &&
      formData.company === (userSession?.user?.company || "") &&
      !formData.image
    ) {
      setShowUpdateForm(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Invalid email format");
      return;
    }



    try {

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("company", formData.company);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }


      const response = await fetch(`/api/register`, {
        method: "PATCH",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      await update({
        user: {
          id: userSession?.user?.id,
          name: data.name,
          email: data.email,
          company: data.company,
          image: data.user.image || userSession?.user?.image,
        },
      });

      router.refresh();

      setShowUpdateForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  useEffect(() => {
    fetchBots();
  }, [status, userSession]);

  if (!userSession) {
    return null;
  }

  const { bots } = botsData;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 justify-center">
        <div className="lg:sticky lg:top-48 lg:self-start lg:w-1/3">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-black text-white py-6 px-8">
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="text-gray-300 mt-1">Manage your account information</p>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <img
                    src={userSession.user.image || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />

                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                  <div>
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userSession.user.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userSession.user.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-9 pt-6">
                  <div>
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userSession.user.id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Company
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userSession.user.company || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between mt-12">


                <Button className="bg-white text-black border border-black py-5 hover:bg-gray-100" onClick={() => setShowUpdateForm(true)}>
                  Update Profile
                </Button>
                <Button className="py-5 border border-black" onClick={deleteAccount}>
                  Delete Account
                </Button>

              </div>
            </div>
          </div>
        </div>

        {showUpdateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-black p-6">
                <h2 className="text-2xl font-bold text-white">Update Profile</h2>
                <p className="text-indigo-100">Edit your personal information</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700 dark:text-gray-300 font-medium">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-700 dark:text-gray-300 font-medium">
                    Profile Picture
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                      />
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.image?.name || "Click to upload"}
                      </p>
                    </label>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateForm(false)}
                    className="px-5 py-2.5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-black text-white transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin h-4 w-4" />
                        Updating...
                      </div>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 ml-16">
            <div className="text-center text-gray-600 text-xl">Loading bots...</div>
          </div>
        ) : bots.length === 0 ? (
          <div className="items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bots</h2>
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 h-64">
              <p className="text-lg text-gray-600 mb-4">You haven't created any bots yet.</p>
              <Link href="/submit-bot">
                <Button className="px-6">Create Your First Bot</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Bots</h2>
              <Link href="/submit-bot">
                <Button>Add Bot</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} onDelete={deleteBot} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

  );
}

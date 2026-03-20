"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Upload, X, Image as ImageIcon } from "lucide-react";

type HealedInfo = {
  clientName: string;
  artistName: string;
  sessionType: string;
  date: string;
  alreadySubmitted: boolean;
};

export default function HealedPhotoPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<HealedInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/healed/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Invalid or expired link.");
          return;
        }
        setInfo(await res.json());
      } catch {
        setError("Failed to load page.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => f.type.startsWith("image/")).slice(0, 5 - files.length);
    const newFiles = [...files, ...valid].slice(0, 5);
    setFiles(newFiles);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return newPreviews;
    });
  }

  function removeFile(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      // Get signed upload URLs
      const urlRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "healed-photos",
          files: files.map((f) => ({ name: f.name, type: f.type })),
          token,
        }),
      });

      if (!urlRes.ok) {
        throw new Error("Failed to get upload URLs.");
      }

      const { uploadUrls } = await urlRes.json() as { uploadUrls: Array<{ signedUrl: string; path: string }> };

      // Upload each file
      const storagePaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { signedUrl, path } = uploadUrls[i];
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: files[i],
          headers: { "Content-Type": files[i].type },
        });
        if (!uploadRes.ok) throw new Error("Upload failed.");
        storagePaths.push(path);
      }

      // Submit paths
      const submitRes = await fetch(`/api/healed/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePaths }),
      });

      if (!submitRes.ok) {
        const data = await submitRes.json();
        throw new Error(data.error ?? "Submission failed.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#71717a]">Loading...</div>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Link unavailable</p>
            <p className="text-[#71717a] text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success || info?.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Thank you!</p>
            <p className="text-[#71717a] text-sm">
              Your healed photo{success && files.length > 1 ? "s have" : " has"} been submitted.{" "}
              {info?.artistName} will love seeing how it turned out.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <p className="text-[#c9a84c] font-bold text-xl">InkBook</p>
          <h1 className="text-white text-2xl font-bold mt-1">Share your healed tattoo</h1>
        </div>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="pt-6 space-y-1 text-sm">
            <p className="text-[#71717a]">
              Hi {info.clientName}! It&apos;s been about 8 weeks since your{" "}
              <span className="text-white">{info.sessionType}</span> session with{" "}
              <span className="text-white">{info.artistName}</span> on{" "}
              <span className="text-white">{info.date}</span>.
            </p>
            <p className="text-[#71717a]">
              Your tattoo should be fully healed by now. {info.artistName} would love to see how it turned out!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white text-base">Upload photos (up to 5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#0f0f0f]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 hover:bg-black"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 text-center hover:border-[#c9a84c] transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-[#52525b] mx-auto mb-2" />
                <p className="text-[#71717a] text-sm">Click to select photos</p>
                <p className="text-[#52525b] text-xs mt-1">JPG, PNG, WEBP — max 5 photos</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={files.length === 0 || uploading}
              className="w-full bg-[#c9a84c] hover:bg-[#b8973b] text-black font-semibold disabled:opacity-40"
            >
              {uploading ? "Uploading..." : "Submit healed photos"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

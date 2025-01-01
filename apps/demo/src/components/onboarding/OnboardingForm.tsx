"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLES = [
  { id: "ux_and_design", label: "UX & Design" },
  { id: "product_management", label: "Product Management" },
  { id: "engineering", label: "Engineering" },
  { id: "data_and_analysis", label: "Data & Analysis" },
  { id: "marketing", label: "Marketing" },
  { id: "account_management", label: "Account Management" },
  { id: "customer_experience", label: "Customer Experience" },
  { id: "customer_support", label: "Customer Support" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    companyName: "",
    orgSize: "",
    country: "",
    city: "",
    street: "",
    zip: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      router.push("/project-setup");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Full Name *"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
        />

        <select
          className="w-full p-2 border rounded-md"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        >
          <option value="">Select Role *</option>
          {ROLES.map((role: { id: string; label: string }) => (
            <option key={role.id} value={role.id}>
              {role.label}
            </option>
          ))}
        </select>

        <Input
          placeholder="Company Name *"
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          required
        />

        <Input
          type="number"
          placeholder="Organization Size *"
          value={formData.orgSize}
          onChange={(e) =>
            setFormData({ ...formData, orgSize: e.target.value })
          }
          required
        />

        <Input
          placeholder="Country *"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          required
        />

        <Input
          placeholder="City *"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          required
        />

        <Input
          placeholder="Street Address *"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          required
        />

        <Input
          placeholder="ZIP Code *"
          value={formData.zip}
          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Completing Setup..." : "Complete Setup"}
      </Button>
    </form>
  );
}

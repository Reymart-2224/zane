"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
type Client = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  username: string;
  role?: string;
  status?: boolean;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    status: true,
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/clients");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load clients");
        return;
      }

      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      status: e.target.value === "active",
    }));
  };

  const resetForm = () => {
    setForm({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      username: "",
      password: "",
      status: true,
    });
  };

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create client");
        setSaving(false);
        return;
      }

      setSuccess("Client created successfully.");
      resetForm();
      setShowForm(false);
      await fetchClients();
    } catch (err) {
      console.error(err);
      setError("Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1d2b35]">Clients</h1>
            <p className="text-sm text-gray-400 mt-1">
              Add clients with login details and contact information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="bg-[#2563eb] text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-[#1d4ed8] transition"
          >
            {showForm ? "Close Form" : "Add Client"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-600">
            {success}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={createClient}
            className="mb-8 rounded-[24px] bg-[#f6fbff] border border-blue-100 p-6"
          >
            <h2 className="text-lg font-bold text-[#1d2b35] mb-5">
              Add New Client
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Company Name
                </label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  placeholder="Company Name"
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Contact Name
                </label>
                <input
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                  required
                  placeholder="Contact Person"
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="client@email.com"
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Username
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="client_username"
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Temporary Password"
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
                <p className="text-[11px] text-gray-400">
                  Password will be hashed before saving.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Status
                </label>
                <select
                  value={form.status ? "active" : "inactive"}
                  onChange={handleStatusChange}
                  className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Client address"
                  className="w-full rounded-xl bg-white border border-blue-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-3 rounded-full bg-white border border-blue-100 text-sm font-semibold text-gray-500 hover:bg-blue-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-full bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving..." : "Save Client"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-3xl border border-[#ecf6f4]">
          <table className="w-full text-sm">
            <thead className="bg-[#f6fbff]">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                  Company
                </th>
                <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                  Contact
                </th>
                <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                  Login
                </th>
                <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                  Status
                </th>
                <th className="text-right px-6 py-4 font-semibold text-[#1d2b35]">
    Action
  </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading clients...
                  </td>
                </tr>
              )}

              {!loading && clients.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No clients found.
                  </td>
                </tr>
              )}

              {!loading &&
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-[#ecf6f4] hover:bg-[#f8fbff]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#1d2b35]">
                        {client.company_name}
                      </p>
                      <p className="text-xs text-gray-400">{client.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1d2b35]">
                        {client.contact_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {client.phone || "No phone"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1d2b35]">
                        {client.username}
                      </p>
                      <p className="text-xs text-gray-400">Role: client</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          client.status
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {client.status ? "Active" : "Inactive"}
                      </span>
                    </td> 

                    <td className="px-6 py-4 text-right">
                    <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="inline-flex rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition"
                    >
                    View
                    </Link>
                    </td>


                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
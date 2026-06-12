"use client";

import { useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 8;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredClients = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        !searchValue ||
        client.company_name?.toLowerCase().includes(searchValue) ||
        client.contact_name?.toLowerCase().includes(searchValue) ||
        client.email?.toLowerCase().includes(searchValue) ||
        client.phone?.toLowerCase().includes(searchValue) ||
        client.username?.toLowerCase().includes(searchValue) ||
        client.address?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && client.status === true) ||
        (statusFilter === "inactive" && client.status !== true);

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeClientsCount = clients.filter(
    (client) => client.status === true
  ).length;

  const inactiveClientsCount = clients.length - activeClientsCount;

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
    <div className="w-full max-w-full space-y-5 overflow-hidden">
      <section className="rounded-[22px] border border-[#ecf6f4] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1d2b35] sm:text-2xl">
              Clients
            </h1>
            <p className="mt-1 text-sm text-gray-400">
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
            className="w-full rounded-full bg-[#2f8c74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#277763] lg:w-auto"
          >
            {showForm ? "Close Form" : "Add Client"}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Clients" value={clients.length} />
          <StatCard label="Active" value={activeClientsCount} />
          <StatCard label="Inactive" value={inactiveClientsCount} />
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-[#d9f3ed] bg-[#e8f7f3] px-5 py-3 text-sm text-[#2f8c74]">
            {success}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={createClient}
            className="mb-8 rounded-[22px] border border-[#d9f3ed] bg-[#f6fbfa] p-4 sm:rounded-[24px] sm:p-6"
          >
            <h2 className="mb-5 text-lg font-bold text-[#1d2b35]">
              Add New Client
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Company Name"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                placeholder="Company Name"
              />

              <InputField
                label="Contact Name"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                required
                placeholder="Contact Person"
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="client@email.com"
              />

              <InputField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />

              <InputField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="client_username"
              />

              <div className="space-y-1">
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Temporary Password"
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
                  className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
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
                  className="w-full rounded-xl border border-[#d9f3ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="w-full rounded-full border border-[#d9f3ed] bg-white px-5 py-3 text-sm font-semibold text-gray-500 transition hover:bg-[#f6fbfa] sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#2f8c74] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#277763] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving..." : "Save Client"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_120px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact, email, username..."
            className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="h-11 rounded-xl border border-[#d9f3ed] bg-[#f6fbfa] px-4 text-sm font-semibold text-[#2f8c74] transition hover:bg-[#e8f7f3]"
          >
            Reset
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <span className="font-semibold text-[#1d2b35]">
              {paginatedClients.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#1d2b35]">
              {filteredClients.length}
            </span>{" "}
            clients
          </p>

          <p>
            Page{" "}
            <span className="font-semibold text-[#1d2b35]">{currentPage}</span>{" "}
            of <span className="font-semibold text-[#1d2b35]">{totalPages}</span>
          </p>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {loading && (
            <div className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] px-5 py-10 text-center text-sm text-gray-400">
              Loading clients...
            </div>
          )}

          {!loading && filteredClients.length === 0 && (
            <div className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] px-5 py-10 text-center text-sm text-gray-400">
              No clients found.
            </div>
          )}

          {!loading &&
            paginatedClients.map((client) => (
              <div
                key={client.id}
                className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-base font-bold text-[#1d2b35]">
                      {client.company_name}
                    </p>
                    <p className="mt-1 break-words text-xs text-gray-400">
                      {client.email}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      client.status
                        ? "bg-[#e8f7f3] text-[#2f8c74]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {client.status ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Contact
                    </p>
                    <p className="mt-1 font-semibold text-[#1d2b35]">
                      {client.contact_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {client.phone || "No phone"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Login
                    </p>
                    <p className="mt-1 font-semibold text-[#1d2b35]">
                      {client.username}
                    </p>
                    <p className="text-xs text-gray-400">Role: client</p>
                  </div>

                  {client.address && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Address
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {client.address}
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="mt-4 inline-flex w-full justify-center rounded-full bg-[#2f8c74] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#277763]"
                >
                  View
                </Link>
              </div>
            ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded-3xl border border-[#ecf6f4] md:block">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-[#f6fbfa]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#1d2b35]">
                  Company
                </th>
                <th className="px-6 py-4 text-left font-semibold text-[#1d2b35]">
                  Contact
                </th>
                <th className="px-6 py-4 text-left font-semibold text-[#1d2b35]">
                  Login
                </th>
                <th className="px-6 py-4 text-left font-semibold text-[#1d2b35]">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-semibold text-[#1d2b35]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading clients...
                  </td>
                </tr>
              )}

              {!loading && filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No clients found.
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-[#ecf6f4] hover:bg-[#f8fbfb]"
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
                            ? "bg-[#e8f7f3] text-[#2f8c74]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {client.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="inline-flex rounded-full bg-[#2f8c74] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#277763]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] p-4">
      <p className="text-sm font-semibold text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#2f8c74]">{value}</p>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      />
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#ecf6f4] bg-[#f6fbfa] px-5 py-4 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing page{" "}
        <span className="font-semibold text-[#1d2b35]">{currentPage}</span> of{" "}
        <span className="font-semibold text-[#1d2b35]">{totalPages}</span> —{" "}
        <span className="font-semibold text-[#1d2b35]">{totalItems}</span>{" "}
        result{totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex-1 rounded-full border border-[#d9f3ed] bg-white px-4 py-2 text-xs font-semibold text-[#2f8c74] transition hover:bg-[#e8f7f3] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          Previous
        </button>

        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#1d2b35]">
          {currentPage}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex-1 rounded-full border border-[#d9f3ed] bg-white px-4 py-2 text-xs font-semibold text-[#2f8c74] transition hover:bg-[#e8f7f3] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          Next
        </button>
      </div>
    </div>
  );
}
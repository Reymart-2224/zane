"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type FirestoreDate =
  | string
  | {
      seconds?: number;
      nanoseconds?: number;
    };

type ClientItem = {
  id: string;
  name: string;
  createdAt: string;
};

type ListingItem = {
  id: string;
  clientId?: string;
  title: string;
  companyName: string;
  status: "active" | "inactive" | "sold" | "pending" | string;
  submissions: number;
  sales: number;
  price?: string;
  createdAt: string;
};

type LeadItem = {
  id: string;
  listingId?: string;
  clientId?: string;
  listingTitle?: string;
  companyName?: string;
  status?: "new" | "answered" | "sales" | "canceled" | "not_interested";
  createdAt: string;
};

function formatDate(value?: FirestoreDate) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (value.seconds) {
    return new Date(value.seconds * 1000).toISOString().split("T")[0];
  }

  return "";
}

function parseAmount(value?: string) {
  if (!value) return 0;

  const cleanValue = String(value).replace(/[^\d.]/g, "");
  const amount = Number(cleanValue);

  return Number.isFinite(amount) ? amount : 0;
}

function isWithinDateRange(date: string, fromDate: string, toDate: string) {
  if (!date) return true;

  const itemDate = new Date(date);

  if (fromDate) {
    const from = new Date(fromDate);
    if (itemDate < from) return false;
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    if (itemDate > to) return false;
  }

  return true;
}

export default function DashboardPage() {
function getCurrentMonthRange() {
  const now = new Date();

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return {
    from: formatDate(firstDay),
    to: formatDate(lastDay),
  };
}
const currentMonthRange = getCurrentMonthRange();

const [fromDate, setFromDate] = useState(currentMonthRange.from);
const [toDate, setToDate] = useState(currentMonthRange.to);

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [clientsSnapshot, listingsSnapshot, leadsSnapshot] =
        await Promise.all([
          getDocs(collection(db, "clients")),
          getDocs(collection(db, "listings")),
          getDocs(collection(db, "leads")),
        ]);

      const fetchedClients: ClientItem[] = clientsSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name:
            data.company_name ||
            data.companyName ||
            data.name ||
            data.contact_name ||
            "Unnamed Client",
          createdAt: formatDate(data.createdAt),
        };
      });

      const fetchedLeads: LeadItem[] = leadsSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          listingId: data.listingId || "",
          clientId: data.clientId || "",
          listingTitle: data.listingTitle || "",
          companyName: data.companyName || "",
          status: data.status || "new",
          createdAt: formatDate(data.createdAt),
        };
      });

      const fetchedListings: ListingItem[] = listingsSnapshot.docs.map((doc) => {
        const data = doc.data();

        const listingLeads = fetchedLeads.filter(
          (lead) => lead.listingId === doc.id
        );

        const listingSales = listingLeads.filter(
          (lead) => lead.status === "sales"
        );

        return {
          id: doc.id,
          clientId: data.clientId || "",
          title: data.title || "Untitled Listing",
          companyName: data.companyName || data.company_name || "Unknown Client",
          status: data.status || "active",
          submissions: listingLeads.length,
          sales: listingSales.length,
          price: data.price || "",
          createdAt: formatDate(data.createdAt),
        };
      });

      setClients(fetchedClients);
      setListings(fetchedListings);
      setLeads(fetchedLeads);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data from Firebase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      isWithinDateRange(client.createdAt, fromDate, toDate)
    );
  }, [clients, fromDate, toDate]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) =>
      isWithinDateRange(listing.createdAt, fromDate, toDate)
    );
  }, [listings, fromDate, toDate]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) =>
      isWithinDateRange(lead.createdAt, fromDate, toDate)
    );
  }, [leads, fromDate, toDate]);

  const filteredSales = useMemo(() => {
    return filteredLeads.filter((lead) => lead.status === "sales");
  }, [filteredLeads]);

  const activeListings = filteredListings.filter(
    (listing) => listing.status === "active"
  );

  const totalSalesAmount = useMemo(() => {
    return filteredSales.reduce((total, sale) => {
      const listing = listings.find((item) => item.id === sale.listingId);

      return total + parseAmount(listing?.price);
    }, 0);
  }, [filteredSales, listings]);

  const topListings = useMemo(() => {
    return [...filteredListings]
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 10);
  }, [filteredListings]);

  const topClientSales = useMemo(() => {
    const clientSalesMap = new Map<
      string,
      {
        clientId: string;
        clientName: string;
        totalSales: number;
        totalAmount: number;
      }
    >();

    filteredSales.forEach((sale) => {
      const listing = listings.find((item) => item.id === sale.listingId);

      if (!listing) return;

      const clientId = listing.clientId || listing.companyName;
      const clientName = listing.companyName || "Unknown Client";
      const saleAmount = parseAmount(listing.price);

      const existingClient = clientSalesMap.get(clientId);

      if (existingClient) {
        existingClient.totalSales += 1;
        existingClient.totalAmount += saleAmount;
      } else {
        clientSalesMap.set(clientId, {
          clientId,
          clientName,
          totalSales: 1,
          totalAmount: saleAmount,
        });
      }
    });

    return Array.from(clientSalesMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }, [filteredSales, listings]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm font-semibold text-[#2f8c74]">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      {error && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 sm:gap-5">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <section className="bg-white rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm border border-[#ecf6f4]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#1d2b35]">
                  Analytics
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Actual overview from Firebase clients, listings, and leads
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-full border border-[#e5eeee] bg-[#f8fbfb] px-4 py-2 text-sm text-[#1d2b35] outline-none focus:border-[#2f8c74]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-full border border-[#e5eeee] bg-[#f8fbfb] px-4 py-2 text-sm text-[#1d2b35] outline-none focus:border-[#2f8c74]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    className="w-full rounded-full bg-[#2f8c74] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="bg-white rounded-[22px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm border border-[#ecf6f4]">
              <p className="text-sm font-semibold text-gray-400">Clients</p>
              <p className="text-3xl font-bold text-[#2f8c74] mt-3">
                {filteredClients.length}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Total clients in selected date range
              </p>
            </div>

            <div className="bg-white rounded-[22px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm border border-[#ecf6f4]">
              <p className="text-sm font-semibold text-gray-400">
                Active Listings
              </p>
              <p className="text-3xl font-bold text-[#2f8c74] mt-3">
                {activeListings.length}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Listings currently marked as active
              </p>
            </div>

            <div className="bg-white rounded-[22px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm border border-[#ecf6f4] sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-semibold text-gray-400">Sales</p>
              <p className="text-3xl font-bold text-[#2f8c74] mt-3">
                {filteredSales.length}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                ₱{totalSalesAmount.toLocaleString()} estimated total amount
              </p>
            </div>
          </section>

            <section className="bg-white rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm border border-[#ecf6f4]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1d2b35]">
                  Top Client Sales
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Top 10 by sales amount
                </p>
              </div>

              <div className="shrink-0 bg-[#2f8c74] text-white rounded-full px-4 py-2 text-xs font-semibold">
                Top 10
              </div>
            </div>

            <div className="space-y-3">
              {topClientSales.length > 0 ? (
                topClientSales.map((client, index) => (
                  <div
                    key={client.clientId}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fbfb] p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1d2b35] truncate">
                        {index + 1}. {client.clientName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {client.totalSales} sale
                        {client.totalSales > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-[#2f8c74]">
                        ₱{client.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400">Total</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[#f8fbfb] p-5 text-center text-sm text-gray-400">
                  No client sales found for the selected date range.
                </div>
              )}
            </div>
          </section>



          <section className="bg-white rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm border border-[#ecf6f4]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1d2b35]">
                  Top 10 Listings
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ranked by actual lead submissions
                </p>
              </div>

              <div className="w-fit bg-[#2f8c74] text-white rounded-full px-4 py-2 text-xs font-semibold">
                {topListings.length} Listings
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs text-gray-400">
                    <th className="px-4 font-semibold">#</th>
                    <th className="px-4 font-semibold">Listing</th>
                    <th className="px-4 font-semibold">Company</th>
                    <th className="px-4 font-semibold">Status</th>
                    <th className="px-4 font-semibold text-center">
                      Submissions
                    </th>
                    <th className="px-4 font-semibold text-center">Sales</th>
                  </tr>
                </thead>

                <tbody>
                  {topListings.length > 0 ? (
                    topListings.map((listing, index) => (
                      <tr key={listing.id} className="bg-[#f8fbfb]">
                        <td className="px-4 py-4 rounded-l-2xl text-sm font-bold text-[#2f8c74]">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#1d2b35]">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            Added {listing.createdAt || "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {listing.companyName}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                              listing.status === "active"
                                ? "bg-[#e8f7f3] text-[#2f8c74]"
                                : listing.status === "sold"
                                  ? "bg-[#fff4e5] text-[#b26a00]"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {listing.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-bold text-[#1d2b35]">
                          {listing.submissions}
                        </td>

                        <td className="px-4 py-4 rounded-r-2xl text-center text-sm font-bold text-[#1d2b35]">
                          {listing.sales}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-gray-400 bg-[#f8fbfb] rounded-2xl"
                      >
                        No listings found for the selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 sm:space-y-5 xl:sticky xl:top-5 self-start">
          <section className="bg-white rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm border border-[#ecf6f4]">
            <h2 className="text-base sm:text-lg font-bold text-[#1d2b35]">
              Summary
            </h2>

            <div className="mt-5 bg-[#f6fbfa] rounded-3xl p-4">
              <p className="text-sm font-semibold text-gray-500 mb-4">
                Selected Range
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">From</span>
                  <span className="font-bold text-[#1d2b35]">
                    {fromDate || "All"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">To</span>
                  <span className="font-bold text-[#1d2b35]">
                    {toDate || "All"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">Listings</span>
                  <span className="font-bold text-[#2f8c74]">
                    {filteredListings.length}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">Active</span>
                  <span className="font-bold text-[#2f8c74]">
                    {activeListings.length}
                  </span>
                </div>
              </div>
            </div>
          </section>

        

          <section className="bg-white rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm border border-[#ecf6f4]">
            <h2 className="text-base sm:text-lg font-bold text-[#1d2b35] mb-5">
              Sales Performance
            </h2>

            <div className="overflow-hidden">
              <svg
                viewBox="0 0 300 130"
                className="w-full h-[130px] sm:h-[150px]"
              >
                <path
                  d="M0 90 C30 20, 60 120, 90 70 S150 10, 180 55 S230 105, 260 65 S290 50, 300 75"
                  fill="none"
                  stroke="#5fae9b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl bg-[#f8fbfb] p-4">
                <p className="text-xs text-gray-400">Sales Count</p>
                <p className="text-xl font-bold text-[#2f8c74] mt-1">
                  {filteredSales.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8fbfb] p-4">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-xl font-bold text-[#2f8c74] mt-1">
                  ₱{totalSalesAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm border border-[#ecf6f4]">
            <h2 className="text-base sm:text-lg font-bold text-[#1d2b35] mb-5">
              Top Listings Preview
            </h2>

            <div className="space-y-3">
              {topListings.slice(0, 5).map((listing, index) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fbfb] p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1d2b35] truncate">
                      {index + 1}. {listing.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {listing.companyName}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#2f8c74]">
                      {listing.submissions}
                    </p>
                    <p className="text-[10px] text-gray-400">Leads</p>
                  </div>
                </div>
              ))}

              {topListings.length === 0 && (
                <div className="rounded-2xl bg-[#f8fbfb] p-5 text-center text-sm text-gray-400">
                  No listing data available.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
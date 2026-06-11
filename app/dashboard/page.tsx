export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
      {/* Left column */}
      <div className="space-y-5">
        {/* Analytics chart card */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-xl font-bold text-[#1d2b35]">Analytics</h1>
              <p className="text-sm text-gray-400 mt-1">Monthly overview</p>
            </div>

            <div className="bg-[#2f8c74] text-white rounded-full px-4 py-2 text-xs font-semibold">
              All Months
            </div>
          </div>

          <div className="h-[260px] flex items-end gap-4 border-b border-[#edf3f3] pb-4">
            {[42, 68, 38, 88, 51, 44, 100, 80, 39, 55, 48, 72].map(
              (height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full max-w-[28px] h-[210px] rounded-full bg-[#edf3f3] flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-full ${
                        index === 1 || index === 6 || index === 7 || index === 11
                          ? "bg-[#91d4c6]"
                          : "bg-[#eef1f1]"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="grid grid-cols-3 text-center mt-4 text-xs font-semibold text-[#2f8c74]">
            <span>October</span>
            <span>November</span>
            <span>December</span>
          </div>
        </section>

        {/* Visitors card */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
          <h2 className="text-lg font-bold text-[#1d2b35] mb-5">Visitors</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-2xl font-bold text-[#2f8c74]">12.9K</p>
              <p className="text-xs text-gray-400">Lorem ipsum</p>
              <p className="text-2xl font-bold text-[#2f8c74] mt-5">212.9K</p>
              <p className="text-xs text-gray-400">Lorem ipsum</p>
            </div>

            <div className="space-y-4">
              <div className="h-12 flex items-center">
                <svg viewBox="0 0 160 50" className="w-full h-full">
                  <path
                    d="M0 35 C20 20, 35 40, 55 25 S95 10, 115 24 S145 32, 160 14"
                    fill="none"
                    stroke="#9bd060"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="h-12 flex items-center">
                <svg viewBox="0 0 160 50" className="w-full h-full">
                  <path
                    d="M0 36 C20 18, 42 40, 60 26 S93 12, 113 28 S143 35, 160 20"
                    fill="none"
                    stroke="#6fc0df"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#2f8c74]">65%</p>
              <p className="text-xs text-gray-400">Lorem ipsum</p>
              <p className="text-2xl font-bold text-[#2f8c74] mt-5">1m 45s</p>
              <p className="text-xs text-gray-400">Lorem ipsum</p>
            </div>
          </div>
        </section>

        {/* Bottom stats */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
          <h2 className="text-lg font-bold text-[#1d2b35] mb-5">Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { value: "85%", label: "Sales", color: "#f5a623" },
              { value: "40%", label: "Clients", color: "#a51fa1" },
              { value: "65%", label: "Growth", color: "#7475d8" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl bg-[#f8fbfb] p-5 flex items-center gap-4"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-bold"
                  style={{
                    background: `conic-gradient(${item.color} ${item.value}, #e9eeee 0)`,
                  }}
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-sm">
                    {item.value}
                  </div>
                </div>

                <div>
                  <p className="font-bold text-[#1d2b35]">{item.label}</p>
                  <p className="text-xs text-gray-400">Lorem ipsum</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
          <h2 className="text-lg font-bold text-[#1d2b35]">Lorem Ipsum</h2>

          <div className="mt-5 bg-[#f6fbfa] rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <button className="flex-1 rounded-full py-2 text-xs font-semibold bg-white text-gray-400">
                Ads
              </button>
              <button className="flex-1 rounded-full py-2 text-xs font-semibold bg-[#2f8c74] text-white">
                Social Ads
              </button>
            </div>

            <p className="text-sm font-semibold text-gray-500 mb-4">
              Dollar Sell Asset
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-[#2f8c74]">230</p>
                <p className="text-[10px] text-gray-400">Lorem ipsum</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#2f8c74]">2</p>
                <p className="text-[10px] text-gray-400">Related</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#2f8c74]">1500</p>
                <p className="text-[10px] text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
          <h2 className="text-lg font-bold text-[#1d2b35] mb-5">Performance</h2>

          <svg viewBox="0 0 300 130" className="w-full h-[150px]">
            <path
              d="M0 90 C30 20, 60 120, 90 70 S150 10, 180 55 S230 105, 260 65 S290 50, 300 75"
              fill="none"
              stroke="#5fae9b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>

          <div className="grid grid-cols-4 text-center text-xs text-gray-400">
            <span>10K</span>
            <span>20K</span>
            <span>30K</span>
            <span>40K</span>
          </div>
        </section>

        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#ecf6f4]">
          <h2 className="text-lg font-bold text-[#1d2b35] mb-5">Lorem Ipsum</h2>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-bold mb-3">Top Products</p>
              <ol className="space-y-2 text-xs text-gray-400 list-decimal list-inside">
                <li>Lorem Ipsum</li>
                <li>Lorem Ipsum</li>
                <li>Lorem Ipsum</li>
              </ol>
            </div>

            <div>
              <p className="font-bold mb-3">Top Buyer</p>
              <ol className="space-y-2 text-xs text-gray-400 list-decimal list-inside">
                <li>Lorem Ipsum</li>
                <li>Lorem Ipsum</li>
                <li>Lorem Ipsum</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
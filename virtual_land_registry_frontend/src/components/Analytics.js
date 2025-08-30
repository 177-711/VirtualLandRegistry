import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

export default function Analytics({ actor }) {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (actor) fetchLands();
  }, [actor]);

  async function fetchLands() {
    try {
      setLoading(true);
      const data = await actor.get_all_lands();
      setLands(data);
    } catch (err) {
      console.error('Analytics fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const totalLands    = lands.length;
  const forSaleCount  = lands.filter((l) => l.for_sale).length;
  const ownedCount    = totalLands - forSaleCount;
  const avgPriceAll   =
    totalLands > 0
      ? lands.reduce((sum, l) => sum + Number(l.price), 0) / totalLands
      : 0;
  const saleLands      = lands.filter((l) => l.for_sale);
  const avgPriceForSale =
    saleLands.length > 0
      ? saleLands.reduce((sum, l) => sum + Number(l.price), 0) /
        saleLands.length
      : 0;

  const statusData = [
    { name: 'For Sale', value: forSaleCount },
    { name: 'Owned', value: ownedCount }
  ];

  const priceData = [
    { name: 'All Lands', avg: avgPriceAll },
    { name: 'For Sale', avg: avgPriceForSale }
  ];

  const trendData = saleLands.map((l) => ({
    name: `#${l.id}`,
    price: Number(l.price)
  }));

  const COLORS = ['#667eea', '#764ba2'];

  return (
    <div className="analytics">
      <h2 className="text-center mb-6">Marketplace Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-center mb-4">Land Status Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {statusData.map((entry, idx) => (
                <Cell key={`slice-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </div>

        <div>
          <h3 className="text-center mb-4">Average Price (ICP)</h3>
          <BarChart
            width={300}
            height={300}
            data={priceData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avg" fill="#667eea" />
          </BarChart>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-center mb-4">Price Trend for Sale Listings</h3>
        {trendData.length > 0 ? (
          <LineChart
            width={600}
            height={300}
            data={trendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#764ba2"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        ) : (
          <p className="text-center">No sale listings to display trend.</p>
        )}
      </div>
    </div>
  );
}
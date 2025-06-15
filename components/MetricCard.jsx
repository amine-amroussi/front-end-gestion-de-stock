const MetricCard = ({ title, value, icon, loading }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
      {icon}
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold">
          {loading ? "Loading..." : value}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
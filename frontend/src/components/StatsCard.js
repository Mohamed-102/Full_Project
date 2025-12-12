export default function StatsCard({ title, value, icon, gradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="opacity-90 mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <img src={icon} alt={title} className="w-12 h-12 opacity-30" />
      </div>
    </div>
  );
}

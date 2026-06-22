const StatCard = ({ title, value, subtitle, large = false }) => {
  return (
    <div className={`stat-card ${large ? "stat-card--large" : ""}`}>
      <p className="stat-card__title">{title}</p>
      <h2 className="stat-card__value">{value}</h2>
      {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
    </div>
  );
};

export default StatCard;

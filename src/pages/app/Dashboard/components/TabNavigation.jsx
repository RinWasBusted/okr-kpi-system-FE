const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overall', label: 'Overall' },
    { id: 'tree', label: 'Objective Tree' },
  ];

  return (
    <div className="flex gap-6 border-b border-secondary/20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab.id
              ? 'text-primary border-b-2 border-primary'
              : 'text-secondary hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;

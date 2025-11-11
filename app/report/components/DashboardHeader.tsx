interface DashboardHeaderProps {
  userName: string;
  lastUpdate: Date;
}

export function DashboardHeader({ userName, lastUpdate }: DashboardHeaderProps) {
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  return (
    <header className="bg-black text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-white">Xin chào, {userName}!</h1>
          <p className="text-gray-300">
            Cập nhật lần cuối: {formatDate(lastUpdate)}
          </p>
        </div>
      </div>
    </header>
  );
}

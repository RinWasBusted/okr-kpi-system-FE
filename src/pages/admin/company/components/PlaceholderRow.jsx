const PlaceholderRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg" />
        <div className="space-y-2">
          <div className="w-32 h-4 bg-secondary/20 rounded" />
          <div className="w-24 h-3 bg-secondary/20 rounded" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="w-16 h-6 bg-secondary/20 rounded-full" />
    </td>
    <td className="px-6 py-4">
      <div className="w-16 h-6 bg-secondary/20 rounded-full" />
    </td>
    <td className="px-6 py-4 text-center">
      <div className="w-8 h-4 bg-secondary/20 rounded mx-auto" />
    </td>
    <td className="px-6 py-4 text-center">
      <div className="w-8 h-4 bg-secondary/20 rounded mx-auto" />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-2">
        <div className="w-20 h-8 bg-secondary/20 rounded" />
        <div className="w-20 h-8 bg-secondary/20 rounded" />
        <div className="w-8 h-8 bg-secondary/20 rounded" />
      </div>
    </td>
  </tr>
);

export default PlaceholderRow;

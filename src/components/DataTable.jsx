function DataTable({ headers, data, renderRow, emptyMessage = 'No hay datos para mostrar.' }) {
  if (data.length === 0) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center text-gray-300 shadow">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="w-full border-collapse text-white text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="py-3 px-4 text-center border-b border-white/20 font-bold bg-dark-table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map(renderRow)}</tbody>
      </table>
    </div>
  )
}

export default DataTable

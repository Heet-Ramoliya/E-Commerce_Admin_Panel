import React from "react";

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}) => {
  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-secondary-800 rounded-lg shadow overflow-hidden ${className}`}
      >
        <div className="p-8 text-center text-secondary-600 dark:text-secondary-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-secondary-800 rounded-lg shadow overflow-hidden ${className}`}
      >
        <div className="p-8 text-center text-secondary-600 dark:text-secondary-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-secondary-800 rounded-lg shadow overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="bg-secondary-50 dark:bg-secondary-800">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-secondary-500 
                    dark:text-secondary-400 uppercase tracking-wider
                    ${column.className || ""}
                  `}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50"
              >
                {columns.map((column, colIndex) => {
                  const value = row[column.field];
                  console.log(
                    `Rendering column ${column.header} for row ${row.id}:`,
                    { value, hasRender: !!column.render }
                  ); // Debug log
                  return (
                    <td
                      key={colIndex}
                      className={`
                        px-6 py-4 whitespace-nowrap text-sm text-secondary-900 
                        dark:text-white
                        ${column.cellClassName || ""}
                      `}
                    >
                      {column.render
                        ? column.render(value, row)
                        : typeof value === "string" || typeof value === "number"
                        ? value
                        : "N/A"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Table Component for Admin Pages
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions with {header, accessor, Cell}
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.onSort - Function to handle sorting
 * @param {Object} props.sortConfig - Current sort configuration {key, direction}
 * @param {Object} props.pagination - Pagination object {page, total, limit}
 * @param {Function} props.onPageChange - Function to handle page change
 * @param {Boolean} props.isLoading - Loading state
 * @param {String} props.emptyMessage - Message to display when no data
 * @param {String} props.className - Additional CSS classes
 */
function Table({
  columns,
  data,
  onSort,
  sortConfig,
  pagination,
  onPageChange,
  isLoading,
  emptyMessage = "No data found",
  className = ""
}) {
  // Handle column header click for sorting
  const handleHeaderClick = (accessor) => {
    if (onSort) {
      onSort(accessor);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination) return null;

    const { page, total, limit } = pagination;
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              page === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              page === totalPages 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  page === 1 ? 'cursor-not-allowed' : ''
                }`}
              >
                <span className="sr-only">Previous</span>
                <i className="fas fa-chevron-left h-5 w-5"></i>
              </button>

              {/* Page numbers */}
              {[...Array(totalPages).keys()].map((number) => {
                const pageNumber = number + 1;
                // Show current page, first, last, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      aria-current={page === pageNumber ? 'page' : undefined}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === pageNumber
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }

                // Show ellipsis
                if (
                  (pageNumber === 2 && page > 3) ||
                  (pageNumber === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                    >
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  page === totalPages ? 'cursor-not-allowed' : ''
                }`}
              >
                <span className="sr-only">Next</span>
                <i className="fas fa-chevron-right h-5 w-5"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {[...Array(5).keys()].map((i) => (
          <tr key={i}>
            {columns.map((column, index) => (
              <td key={index} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <i className="fas fa-inbox text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{emptyMessage}</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      scope="col"
                      className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 ${
                        onSort ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => onSort && handleHeaderClick(column.accessor)}
                    >
                      <div className="flex items-center">
                        {column.header}
                        {sortConfig && sortConfig.key === column.accessor && (
                          <span className="ml-2 text-blue-600">
                            <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-xs`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              {isLoading ? renderSkeleton() : data.length > 0 ? (
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                      {columns.map((column) => (
                        <td key={column.accessor} className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          {column.Cell ? column.Cell(row) : row[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ) : renderEmptyState()}
            </table>
          </div>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
}

export default Table;
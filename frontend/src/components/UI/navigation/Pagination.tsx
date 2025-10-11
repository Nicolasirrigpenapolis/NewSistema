import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center">
      <ul className="flex items-center space-x-1">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${currentPage === 1
                ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                : 'text-foreground bg-card dark:bg-gray-700 border border-gray-300 dark:border-0 hover:bg-background dark:hover:bg-gray-600'
              }
            `}
          >
            Anterior
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${number === currentPage
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'text-foreground bg-card dark:bg-gray-700 border border-gray-300 dark:border-0 hover:bg-background dark:hover:bg-gray-600'
                }
              `}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                : 'text-foreground bg-card dark:bg-gray-700 border border-gray-300 dark:border-0 hover:bg-background dark:hover:bg-gray-600'
              }
            `}
          >
            Próximo
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;

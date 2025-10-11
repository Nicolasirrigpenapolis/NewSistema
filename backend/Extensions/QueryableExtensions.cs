using Backend.Api.Models;
using Backend.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Extensions
{
    public static class QueryableExtensions
    {
        public static async Task<PagedResult<T>> ToPaginatedListAsync<T>(
            this IQueryable<T> query,
            int page,
            int pageSize)
        {
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Page = page,
                PageSize = pageSize,
                HasNextPage = page * pageSize < totalItems,
                HasPreviousPage = page > 1
            };
        }

        public static async Task<PagedResult<T>> ToPaginatedListAsync<T>(
            this IQueryable<T> query,
            PaginationRequest request)
        {
            return await query.ToPaginatedListAsync(request.Page, request.PageSize);
        }
    }
}

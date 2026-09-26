"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

import { hsnSacService } from "@/modules/items/services/hsn-sac.service";
import type { HsnSac } from "@/modules/items/types/hsn-sac";
import type { HsnSacQueryType } from "@/modules/items/api/hsn-sac.api";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE = 400;

interface PaginatedHsnSacSelectProps {
  id: string;
  type: HsnSacQueryType;
  value?: string;
  placeholder: string;
  onValueChange: (value: string) => void;
}

/**
 * Normalize different possible API response structures.
 */
function getRecords(
  response: unknown
): {
  records: HsnSac[];
  page: number;
  totalPages?: number;
} {
  const responseData = response as {
    data?: {
      data?: unknown;
    };
  };

  const payload = responseData?.data?.data;

  // API returns directly:
  // data: [...]
  if (Array.isArray(payload)) {
    return {
      records: payload as HsnSac[],
      page: 1,
    };
  }

  // API returns:
  // data: {
  //   data: [],
  //   page: 1,
  //   totalPages: 10
  // }
  const data = payload as
    | {
        data?: unknown;
        page?: number;
        totalPages?: number;
      }
    | undefined;

  return {
    records: Array.isArray(data?.data)
      ? (data.data as HsnSac[])
      : [],

    page: Number(data?.page ?? 1),

    totalPages:
      data?.totalPages === undefined
        ? undefined
        : Number(data.totalPages),
  };
}

export default function PaginatedHsnSacSelect({
  id,
  type,
  value,
  placeholder,
  onValueChange,
}: PaginatedHsnSacSelectProps) {
  // =========================================================
  // Dropdown state
  // =========================================================

  const [open, setOpen] = useState(false);

  // =========================================================
  // Search state
  // =========================================================

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // =========================================================
  // Pagination state
  // =========================================================

  const [records, setRecords] = useState<HsnSac[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // =========================================================
  // Loading state
  // =========================================================

  const [loading, setLoading] = useState(false);

  // =========================================================
  // Request control
  // =========================================================

  const requestId = useRef(0);

  const searchTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // =========================================================
  // Load page
  // =========================================================

  const loadPage = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      append: boolean
    ) => {
      const currentRequest = ++requestId.current;

      setLoading(true);

      try {
        const response =
          await hsnSacService.getHsnSacRecordsForDropdown(
            type,
            nextPage,
            PAGE_SIZE,
            nextSearch.trim()
          );

        const result = getRecords(response);

        // Ignore old/stale requests
        if (currentRequest !== requestId.current) {
          return;
        }

        // =====================================================
        // Update records
        // =====================================================

        setRecords((currentRecords) => {
          if (!append) {
            return result.records;
          }

          // Prevent duplicate records when API/page events
          // fire more than once.
          const existingCodes = new Set(
            currentRecords.map(
              (record) =>
                record.code ||
                record.hsnCode ||
                record.sacCode ||
                ""
            )
          );

          const newRecords = result.records.filter(
            (record) => {
              const code =
                record.code ||
                record.hsnCode ||
                record.sacCode ||
                "";

              if (!code || existingCodes.has(code)) {
                return false;
              }

              existingCodes.add(code);
              return true;
            }
          );

          return [...currentRecords, ...newRecords];
        });

        // =====================================================
        // Pagination
        // =====================================================

        const currentPage =
          result.page || nextPage;

        setPage(currentPage);

        // If API provides totalPages
        if (result.totalPages !== undefined) {
          setHasMore(
            currentPage < result.totalPages
          );
        } else {
          // Fallback based on returned page size
          setHasMore(
            result.records.length === PAGE_SIZE
          );
        }
      } catch {
        if (
          currentRequest === requestId.current
        ) {
          setHasMore(false);
        }
      } finally {
        if (
          currentRequest === requestId.current
        ) {
          setLoading(false);
        }
      }
    },
    [type]
  );

  // =========================================================
  // Execute search
  // =========================================================

  const runSearch = useCallback(
    (searchValue = search) => {
      const nextSearch =
        searchValue.trim();

      setAppliedSearch(nextSearch);
      setRecords([]);
      setPage(0);
      setHasMore(true);

      void loadPage(
        1,
        nextSearch,
        false
      );
    },
    [loadPage, search]
  );

  // =========================================================
  // Search input change
  // =========================================================

  const handleSearchChange = (
    nextSearch: string
  ) => {
    setSearch(nextSearch);

    // Clear previous debounce
    if (searchTimer.current) {
      clearTimeout(
        searchTimer.current
      );

      searchTimer.current = null;
    }

    const trimmedSearch =
      nextSearch.trim();

    // =======================================================
    // Empty search
    // =======================================================

    if (trimmedSearch.length === 0) {
      setAppliedSearch("");
      setRecords([]);
      setPage(0);
      setHasMore(true);

      searchTimer.current =
        setTimeout(() => {
          runSearch("");
        }, SEARCH_DEBOUNCE);

      return;
    }

    // =======================================================
    // Less than 2 characters
    // =======================================================

    if (trimmedSearch.length < 2) {
      setRecords([]);
      setHasMore(false);
      return;
    }

    // =======================================================
    // Debounced server search
    // =======================================================

    searchTimer.current =
      setTimeout(() => {
        runSearch(nextSearch);
      }, SEARCH_DEBOUNCE);
  };

  // =========================================================
  // Handle dropdown scroll
  // =========================================================

  const handleScroll = (
    event: React.UIEvent<HTMLDivElement>
  ) => {
    const element =
      event.currentTarget;

    const distanceFromBottom =
      element.scrollHeight -
      element.scrollTop -
      element.clientHeight;

    const nearBottom =
      distanceFromBottom < 32;

    if (
      nearBottom &&
      hasMore &&
      !loading
    ) {
      void loadPage(
        page + 1,
        appliedSearch,
        true
      );
    }
  };

  // =========================================================
  // Dropdown open / close
  // =========================================================

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    setOpen(nextOpen);

    // =======================================================
    // Opening dropdown
    // =======================================================

    if (nextOpen) {
      setRecords([]);
      setPage(0);
      setHasMore(true);

      void loadPage(
        1,
        appliedSearch,
        false
      );

      return;
    }

    // =======================================================
    // Closing dropdown
    // =======================================================

    if (searchTimer.current) {
      clearTimeout(
        searchTimer.current
      );

      searchTimer.current = null;
    }

    setSearch("");
    setAppliedSearch("");
  };

  // =========================================================
  // Cleanup debounce timer
  // =========================================================

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(
          searchTimer.current
        );
      }
    };
  }, []);

  // =========================================================
  // Preserve selected value
  // =========================================================
  //
  // If the selected HSN/SAC is not currently present in
  // the loaded page, show it temporarily so Radix Select
  // can still display the selected value.
  //
  // =========================================================

  const selectedExists =
    !!value &&
    records.some((record) => {
      const code =
        record.code ||
        record.hsnCode ||
        record.sacCode;

      return code === value;
    });

  const selectedRecord: HsnSac[] =
    value && !selectedExists
      ? [
          {
            id: `selected-${value}`,
            code: value,
            description: "",
            type,
          },
        ]
      : [];

  // =========================================================
  // Visible records
  // =========================================================

  const visibleRecords = [
    ...selectedRecord,
    ...records,
  ];

  // =========================================================
  // Render
  // =========================================================

  return (
    <Select
      value={value ?? ""}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={handleOpenChange}
    >
      {/* ===================================================
          Trigger
      =================================================== */}

      <SelectTrigger id={id}>
        <SelectValue
          placeholder={placeholder}
        />
      </SelectTrigger>

      {/* ===================================================
          Content

          IMPORTANT:
          onViewportScroll is handled by our custom
          SelectContent and forwarded to Radix Viewport.
      =================================================== */}

      <SelectContent
        onViewportScroll={handleScroll}
      >
        {/* =================================================
            Search area
        ================================================= */}

        <div className="sticky top-0 z-10 bg-white p-1">
          <div className="relative">
            <Input
              value={search}
              placeholder={`Search ${type} code...`}
              className="pr-9"
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
              onKeyDownCapture={(event) => {
                event.stopPropagation();

                if (event.key === "Enter") {
                  event.preventDefault();

                  if (
                    search.trim().length === 0 ||
                    search.trim().length >= 2
                  ) {
                    runSearch();
                  }
                }
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
            />

            {/* =============================================
                Search button
            ============================================= */}

            <button
              type="button"
              aria-label={`Search ${type}`}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();

                const trimmedSearch =
                  search.trim();

                if (
                  trimmedSearch.length === 0 ||
                  trimmedSearch.length >= 2
                ) {
                  runSearch();
                }
              }}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* =================================================
            Records
        ================================================= */}

        {visibleRecords.map((record) => {
          const code =
            record.code ||
            record.hsnCode ||
            record.sacCode ||
            "";

          if (!code) {
            return null;
          }

          return (
            <SelectItem
              key={`${record.id}-${code}`}
              value={code}
            >
              {code}

              {record.description
                ? ` - ${record.description}`
                : ""}
            </SelectItem>
          );
        })}

        {/* =================================================
            Loading
        ================================================= */}

        {loading && (
          <div className="px-3 py-2 text-center text-sm text-gray-500">
            Loading...
          </div>
        )}

        {/* =================================================
            No results
        ================================================= */}

        {!loading &&
          visibleRecords.length === 0 && (
            <div className="px-3 py-2 text-center text-sm text-gray-500">
              {search.trim().length === 1
                ? "Enter at least 2 characters."
                : "No records found."}
            </div>
          )}

        {/* =================================================
            End of results
        ================================================= */}

        {!loading &&
          visibleRecords.length > 0 &&
          !hasMore && (
            <div className="px-3 py-2 text-center text-xs text-gray-400">
              No more records
            </div>
          )}
      </SelectContent>
    </Select>
  );
}












// "use client";

// import { useCallback, useRef, useState } from "react";
// import { Search } from "lucide-react";
// import {
//   Input,
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui";
// import { hsnSacService } from "@/modules/items/services/hsn-sac.service";
// import type { HsnSac } from "@/modules/items/types/hsn-sac";
// import type { HsnSacQueryType } from "@/modules/items/api/hsn-sac.api";

// const PAGE_SIZE = 10;

// interface PaginatedHsnSacSelectProps {
//   id: string;
//   type: HsnSacQueryType;
//   value?: string;
//   placeholder: string;
//   onValueChange: (value: string) => void;
// }

// function getRecords(response: unknown): { records: HsnSac[]; page: number; totalPages?: number } {
//   const responseData = response as { data?: { data?: unknown } };
//   const payload = responseData?.data?.data;
//   const data = payload as { data?: unknown; page?: number; totalPages?: number } | unknown[] | undefined;

//   if (Array.isArray(data)) {
//     return { records: data as HsnSac[], page: 1 };
//   }

//   return {
//     records: Array.isArray(data?.data) ? data.data as HsnSac[] : [],
//     page: Number(data?.page ?? 1),
//     totalPages: data?.totalPages === undefined ? undefined : Number(data.totalPages),
//   };
// }

// export default function PaginatedHsnSacSelect({
//   id,
//   type,
//   value,
//   placeholder,
//   onValueChange,
// }: PaginatedHsnSacSelectProps) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [appliedSearch, setAppliedSearch] = useState("");
//   const [records, setRecords] = useState<HsnSac[]>([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const requestId = useRef(0);
//   const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const loadPage = useCallback(async (nextPage: number, nextSearch: string, append: boolean) => {
//     const currentRequest = ++requestId.current;
//     setLoading(true);

//     try {
//       const response = await hsnSacService.getHsnSacRecordsForDropdown(
//         type,
//         nextPage,
//         PAGE_SIZE,
//         nextSearch.trim()
//       );
//       const result = getRecords(response);

//       if (currentRequest !== requestId.current) {
//         return;
//       }

//       setRecords((currentRecords) => append ? [...currentRecords, ...result.records] : result.records);
//       setPage(result.page || nextPage);
//       setHasMore(result.totalPages === undefined
//         ? result.records.length === PAGE_SIZE
//         : result.page < result.totalPages);
//     } catch {
//       if (currentRequest === requestId.current) {
//         setHasMore(false);
//       }
//     } finally {
//       if (currentRequest === requestId.current) {
//         setLoading(false);
//       }
//     }
//   }, [type]);

//   const runSearch = (searchValue = search) => {
//     const nextSearch = searchValue.trim();

//     setAppliedSearch(nextSearch);
//     setRecords([]);
//     setPage(0);
//     setHasMore(true);
//     void loadPage(1, nextSearch, false);
//   };

//   const handleSearchChange = (nextSearch: string) => {
//     setSearch(nextSearch);

//     if (searchTimer.current) {
//       clearTimeout(searchTimer.current);
//     }

//     const trimmedSearch = nextSearch.trim();

//     if (trimmedSearch.length < 2 && trimmedSearch.length > 0) {
//       setRecords([]);
//       setHasMore(false);
//       return;
//     }

//     searchTimer.current = setTimeout(() => {
//       runSearch(nextSearch);
//     }, 400);
//   };

//   const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
//     const element = event.currentTarget;
//     const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 32;

//     if (nearBottom && hasMore && !loading) {
//       void loadPage(page + 1, appliedSearch, true);
//     }
//   };

//   const handleOpenChange = (nextOpen: boolean) => {
//     setOpen(nextOpen);

//     if (nextOpen) {
//       setRecords([]);
//       setPage(0);
//       setHasMore(true);
//       void loadPage(1, appliedSearch, false);
//     }

//     if (!nextOpen) {
//       if (searchTimer.current) {
//         clearTimeout(searchTimer.current);
//         searchTimer.current = null;
//       }

//       setSearch("");
//       setAppliedSearch("");
//     }
//   };

//   const selectedRecord: HsnSac[] = value && !records.some((record) => (record.code || record.hsnCode || record.sacCode) === value)
//     ? [{ id: `selected-${value}`, code: value, description: "", type }]
//     : [];
//   const visibleRecords = [...selectedRecord, ...records];

//   return (
//     <Select
//       value={value ?? ""}
//       onValueChange={onValueChange}
//       open={open}
//       onOpenChange={handleOpenChange}
//     >
//       <SelectTrigger id={id}>
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent onViewportScroll={handleScroll}>
//         <div className="sticky top-0 z-10 bg-white p-1">
//           <Input
//             value={search}
//             placeholder={`Search ${type} code...`}
//             className="pr-9"
//             onChange={(event) => handleSearchChange(event.target.value)}
//             onKeyDownCapture={(event) => {
//               event.stopPropagation();

//               if (event.key === "Enter") {
//                 event.preventDefault();
//                 runSearch();
//               }
//             }}
//             onPointerDown={(event) => event.stopPropagation()}
//           />
//           <button
//             type="button"
//             aria-label={`Search ${type}`}
//             className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100"
//             onPointerDown={(event) => event.stopPropagation()}
//             onClick={(event) => {
//               event.stopPropagation();
//               runSearch();
//             }}
//           >
//             <Search className="h-4 w-4" />
//           </button>
//         </div>
//         {visibleRecords.map((record) => {
//           const code = record.code || record.hsnCode || record.sacCode || "";

//           return code ? (
//             <SelectItem key={`${record.id}-${code}`} value={code}>
//               {code}{record.description ? ` - ${record.description}` : ""}
//             </SelectItem>
//           ) : null;
//         })}
//         {loading && <div className="px-3 py-2 text-center text-sm text-gray-500">Loading...</div>}
//         {!loading && visibleRecords.length === 0 && (
//           <div className="px-3 py-2 text-center text-sm text-gray-500">No records found.</div>
//         )}
//       </SelectContent>
//     </Select>
//   );
// }
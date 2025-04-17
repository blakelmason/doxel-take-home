import { useEffect, useMemo, useRef, useState } from "react";
import data from "./DoxelAssessmentData.json";

interface DataItem {
    id: string;
    validated: boolean;
    content: string;
    quantity: number;
    instances: number[];
    metadata: {
        inspected: boolean;
        inspectTimestamp: string | null;
    };
}

const ROW_HEIGHT = 50;
const BUFFER = 5;
const VIEWPORT_HEIGHT = 600;

const COL_ID = "basis-[25%]";
const COL_VALIDATED = "basis-[5%]";
const COL_CONTENT = "basis-[35%]";
const COL_QUANTITY = "basis-[5%]";
const COL_INSTANCES = "basis-[20%]";
const COL_TIMESTAMP = "basis-[10%]";

const isImageUrl = (url: string) =>
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|png)$/i.test(url);

export default function App() {
    const [filter, setFilter] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        const onScroll = () => {
            if (el) setScrollTop(el.scrollTop);
        };
        el?.addEventListener("scroll", onScroll);
        return () => el?.removeEventListener("scroll", onScroll);
    }, []);

    const filteredSortedData = useMemo(() => {
        let result = data as DataItem[];
        if (filter.trim()) {
            result = result.filter((r) =>
                r.id.toLowerCase().includes(filter.toLowerCase())
            );
        }
        result = [...result].sort((a, b) =>
            sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)
        );
        return result;
    }, [filter, sortAsc]);

    const totalRows = filteredSortedData.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
    const endIndex = Math.min(
        totalRows,
        startIndex + Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + BUFFER * 2
    );
    const visibleRows = filteredSortedData.slice(startIndex, endIndex);

    return (
        <div className="p-4 font-sans bg-gray-900 text-white min-h-screen">
            <div className="mb-4 flex items-center gap-4">
                <input
                    placeholder="Filter by ID"
                    className="border border-gray-400 px-2 py-1 bg-gray-800 text-white"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    onClick={() => setSortAsc((s) => !s)}
                    className="border border-gray-400 px-2 py-1 bg-gray-800 text-white"
                >
                    Sort by ID ({sortAsc ? "asc" : "desc"})
                </button>
            </div>

            {/* Table Header */}
            <div className="bg-gray-700 text-white flex h-[50px] items-center px-2 text-sm gap-2 border-t border-x border-gray-400">
                <div className={`font-bold ${COL_ID}`}>ID</div>
                <div className={`font-bold text-center ${COL_VALIDATED}`}>
                    Validated
                </div>
                <div className={`font-bold ${COL_CONTENT}`}>Content</div>
                <div className={`font-bold ${COL_QUANTITY}`}>Quantity</div>
                <div className={`font-bold ${COL_INSTANCES}`}>Instances</div>
                <div className={`font-bold ${COL_TIMESTAMP}`}>Timestamp</div>
            </div>

            {/* Virtualized Rows */}
            <div
                ref={containerRef}
                className="border border-gray-400 h-[600px] overflow-y-scroll relative bg-gray-800"
            >
                <div
                    style={{
                        height: totalRows * ROW_HEIGHT,
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            transform: `translateY(${
                                startIndex * ROW_HEIGHT
                            }px)`,
                        }}
                        className="absolute top-0 left-0 right-0"
                    >
                        {visibleRows.map((row, idx) => (
                            <div
                                key={row.id}
                                className={`flex h-[50px] items-center px-2 text-sm gap-2 border-b border-gray-700 ${
                                    (startIndex + idx) % 2 === 0
                                        ? "bg-gray-900"
                                        : "bg-gray-800"
                                }`}
                            >
                                <div
                                    className={`truncate font-mono ${COL_ID}`}
                                    title={row.id}
                                >
                                    {row.id}
                                </div>
                                <div
                                    className={`text-center ${COL_VALIDATED}`}
                                    title={
                                        row.validated
                                            ? "Validated"
                                            : "Not validated"
                                    }
                                >
                                    {row.validated ? "✅" : "❌"}
                                </div>
                                <div
                                    className={`truncate ${COL_CONTENT}`}
                                    title={row.content}
                                >
                                    {isImageUrl(row.content) ? (
                                        <img
                                            src={row.content}
                                            alt="content"
                                            className="max-h-[40px] max-w-full"
                                        />
                                    ) : (
                                        row.content
                                    )}
                                </div>
                                <div
                                    className={COL_QUANTITY}
                                    title={String(row.quantity)}
                                >
                                    {row.quantity}
                                </div>
                                <div
                                    className={`truncate ${COL_INSTANCES}`}
                                    title={row.instances.join(", ")}
                                >
                                    {row.instances.join(", ")}
                                </div>
                                <div
                                    className={`truncate text-gray-400 ${COL_TIMESTAMP}`}
                                    title={row.metadata.inspectTimestamp || "—"}
                                >
                                    {row.metadata.inspectTimestamp || "—"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

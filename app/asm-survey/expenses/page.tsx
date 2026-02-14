"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Download, Loader2, X } from "lucide-react";
import { getExpenses } from "@/services/masterData";

interface Expense {
  id: string | number;
  category: string;
  amount: string | number;
  image?: string;
}

interface SurveyRoute {
  id: string | number;
  title: string;
  date: string;
  expenses: Expense[];
  totalExpense: number;
  remarks?: string;
  status?: string;
}

function ExpensesContent() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");

  const [surveyRoutes, setSurveyRoutes] = useState<SurveyRoute[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("0"); // 0: current, 1: 1 month, 2: 3 months
  const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<SurveyRoute | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [remarkStatus, setRemarkStatus] = useState("Approved");

  useEffect(() => {
    if (!tourId) {
      setLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        console.log("getExpenses function:", getExpenses);
        const payload = { tourId, filter: parseInt(filterValue) };
        console.log("Calling getExpenses with payload:", payload);
        const res: any = await getExpenses(payload);
        console.log("getExpenses response:", res);

        // Robust data extraction (handles res.data.data, res.data, or direct array)
        const data = res?.data?.data || res?.data || res || [];
        console.log("Extracted expenses data:", data);

        if (Array.isArray(data)) {
          const mappedExpenses: Expense[] = data.map((item: any) => ({
            id: item.id || item._id || Math.random().toString(),
            category: item.category || item.description || "General",
            amount: `₹ ${item.amount || 0}`,
            image: item.image,
          }));

          const total = data.reduce(
            (sum: number, item: any) => sum + (Number(item.amount) || 0),
            0,
          );

          // Helper function to extract and format date from any field
          const getDateString = (item: any): string => {
            // Try multiple date field names
            const dateField = item?.createdAt || item?.created_at || item?.createdDate || item?.date || item?.timestamp;
            
            if (!dateField) {
              console.warn("No date field found in item:", item);
              return "Recent";
            }

            try {
              let date: Date;
              
              // Handle Firestore timestamp (seconds property)
              if (dateField.seconds !== undefined) {
                date = new Date(dateField.seconds * 1000);
              }
              // Handle Firestore timestamp with _seconds
              else if (dateField._seconds !== undefined) {
                date = new Date(dateField._seconds * 1000);
              }
              // Handle milliseconds timestamp
              else if (typeof dateField === "number") {
                date = new Date(dateField);
              }
              // Handle date string
              else if (typeof dateField === "string") {
                date = new Date(dateField);
              }
              // Handle Date object
              else if (dateField instanceof Date) {
                date = dateField;
              }
              // Try toDate method (Firestore Timestamp)
              else if (typeof dateField.toDate === "function") {
                date = dateField.toDate();
              }
              else {
                console.warn("Unknown date format:", dateField);
                return "Recent";
              }

              if (isNaN(date.getTime())) {
                console.warn("Invalid date:", dateField);
                return "Recent";
              }

              return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            } catch (error) {
              console.error("Error parsing date:", error, dateField);
              return "Recent";
            }
          };

          const route: SurveyRoute = {
            id: tourId,
            title: "Tour Expenses",
            date: data[0] ? getDateString(data[0]) : "Recent",
            expenses: mappedExpenses,
            totalExpense: total,
            status: "Pending",
          };

          setSurveyRoutes([route]);
          setExpandedRoutes([tourId]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [tourId, filterValue]);

  const toggleRoute = (id: string | number) => {
    setExpandedRoutes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const openRemarkDrawer = (route: SurveyRoute) => {
    setSelectedRoute(route);
    setRemarkText(route.remarks || "");
    setRemarkStatus(route.status || "Approved");
    setRemarkDrawerOpen(true);
  };

  const closeRemarkDrawer = () => {
    setRemarkDrawerOpen(false);
    setSelectedRoute(null);
    setRemarkText("");
    setRemarkStatus("Approved");
  };

  const handleUpdateRemark = async () => {
    if (!selectedRoute) return;

    try {
      console.log("Updating remark for route:", selectedRoute.id, {
        remark: remarkText,
        status: remarkStatus,
      });
      // TODO: Add API call to update remarks
      // await updateExpenseRemark(selectedRoute.id, { remarks: remarkText, status: remarkStatus });

      // Update local state
      setSurveyRoutes((prev) =>
        prev.map((route) =>
          route.id === selectedRoute.id
            ? { ...route, remarks: remarkText, status: remarkStatus }
            : route,
        ),
      );

      closeRemarkDrawer();
    } catch (error) {
      console.error("Error updating remark:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
        <p className="text-gray-500">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className=" min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold ">ASM Survey Expenses</h2>

        <div className="flex gap-3">
          <select className="px-4 py-2 border rounded-lg text-sm bg-[#F87B1B1A] text-[#F87B1B] font-semibold">
            <option>District</option>
          </select>
          <select 
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className=" bg-[#F87B1B1A] text-[#F87B1B] px-4 py-2 border rounded-lg text-sm"
          >
            <option value="0">Today</option>
            <option value="1">1 Month</option>
            <option value="2">3 Months</option>
          </select>
        </div>
      </div>

      {/* Routes */}
      <div className="space-y-4">
        {surveyRoutes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">No expenses found for this tour.</p>
          </div>
        ) : (
          surveyRoutes.map((route) => (
            <div key={route.id} className="space-y-2">
              {/* Route Header */}
              <div className="flex justify-between items-center gap-4">
                <div className="w-full bg-[#F87B1B1A] rounded-lg px-6 py-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-semibold text-[#F87B1B]">
                      {route.title}
                    </h3>
                    <p className="text-sm py-1 ">{route.date}</p>
                  </div>

                  <button
                    onClick={() => toggleRoute(route.id)}
                    className="text-[#F87B1B] hover:opacity-80"
                  >
                    {expandedRoutes.includes(route.id) ? (
                      <Minus className="w-6 h-6" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </button>
                </div>
               <div className=" flex justify-end">
                    <Button
                      onClick={() => openRemarkDrawer(route)}
                      className="bg-[#F87B1B] hover:bg-[#E86A0A] text-white font-semibold  text-md px-8 py-6"
                    >
                      Remark
                    </Button>
                  </div>
</div>
              {/* Expanded Content */}
              {expandedRoutes.includes(route.id) && (
                <div className="bg-white rounded-lg border p-5 w-full lg:w-[87%]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S No.</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Image</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.expenses.map((exp, index) => (
                        <TableRow key={exp.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{exp.category}</TableCell>
                          <TableCell className="font-semibold">
                            {exp.amount}
                          </TableCell>
                          <TableCell>
                            {exp.image ? (
                              <img
                                src={
                                  exp.image.startsWith("data:") ||
                                  exp.image.startsWith("http")
                                    ? exp.image
                                    : `data:image/jpeg;base64,${exp.image}`
                                }
                                alt="Receipt"
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md border">
                                <span className="text-[10px] text-gray-400">
                                  No Image
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="text-sm text-gray-500 pt-4">
                    Total Expense :{" "}
                    <span className="font-semibold">
                      ₹ {route.totalExpense}
                    </span>
                  </div>

                  {/* Remark Button */}
                  
                </div>
                
              )}
             
            </div>
          ))
        )}
      </div>

      {/* Remark Drawer Side Panel */}
      {remarkDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-[#F87B1B] text-white p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Expense Remark</h3>
            <button
              onClick={closeRemarkDrawer}
              className="text-white hover:opacity-80"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Location Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Location
              </label>
              <p className="text-gray-800 font-medium">
                {selectedRoute?.title}
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Date
              </label>
              <p className="text-gray-800">{selectedRoute?.date}</p>
            </div>

            {/* Total Expense */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Total Expense
              </label>
              <input
                type="text"
                value={`₹ ${selectedRoute?.totalExpense}`}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Remark Text Area */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Remark
              </label>
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B] resize-none"
                rows={5}
                placeholder="Add remarks here..."
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Status
              </label>
              <select
                value={remarkStatus}
                onChange={(e) => setRemarkStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B] bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Footer - Update Button */}
          <div className="border-t p-6 bg-gray-50">
            <Button
              onClick={handleUpdateRemark}
              className="w-full bg-[#F87B1B] hover:bg-[#E86A0A] text-white font-semibold py-2"
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SurveyExpensesPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
          </div>
        }
      >
        <ExpensesContent />
      </Suspense>
    </DashboardLayout>
  );
}

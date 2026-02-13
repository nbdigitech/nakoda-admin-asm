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
import { Plus, Minus, Download, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (!tourId) {
      setLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        console.log("getExpenses function:", getExpenses);
        const payload = { tourId };
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

          const route: SurveyRoute = {
            id: tourId,
            title: "Tour Expenses",
            date: data[0]?.createdAt
              ? new Date(
                  data[0].createdAt.seconds
                    ? data[0].createdAt.seconds * 1000
                    : data[0].createdAt,
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
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
  }, [tourId]);

  const toggleRoute = (id: string | number) => {
    setExpandedRoutes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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
          <select className=" bg-[#F87B1B1A] text-[#F87B1B] px-4 py-2 border rounded-lg text-sm">
            <option>1 Month</option>
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
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#F87B1B1A] rounded-lg px-3 py-2 flex items-center justify-between">
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
                </div>
              )}
            </div>
          ))
        )}
      </div>
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

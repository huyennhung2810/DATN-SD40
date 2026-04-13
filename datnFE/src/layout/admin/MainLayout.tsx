import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { shiftHandoverApi } from "../../api/shiftHandoverApi";
import { shiftActions } from "../../redux/shiftHandover/shiftHandoverSlice";
import type { RootState } from "../../redux/store";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  // --- Đồng bộ lại ca làm việc khi reload ở bất kỳ trang nào ---
  const dispatch = useDispatch();
  const { currentShift } = useSelector(
    (state: RootState) => state.shiftHandover,
  );
  useEffect(() => {
    const fetchShiftStats = async () => {
      if (currentShift?.workScheduleId) {
        try {
          const stats = await shiftHandoverApi.getShiftStats(
            currentShift.workScheduleId,
          );
          dispatch(shiftActions.checkInSuccess({ ...currentShift, ...stats }));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            "[MainLayout] Không thể đồng bộ lại thông tin ca làm việc:",
            err,
          );
        }
      }
    };
    if (currentShift) {
      fetchShiftStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShift?.workScheduleId]);
  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-layout)",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Header />

        <main
          style={{
            flex: 1,
            padding: "var(--spacing-xl)",
            backgroundColor: "var(--color-bg-layout)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "1600px",
              margin: "0 auto",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

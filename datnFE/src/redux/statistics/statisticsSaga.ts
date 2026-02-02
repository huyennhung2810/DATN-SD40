import { all, call, put, takeLatest } from "redux-saga/effects";
import { statisticsActions } from "./statisticsSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import statisticsApi from "../../api/statisticsApi";

function* handleFetchData(action: PayloadAction<string>): SagaIterator {
  try {
    const [summaryRes, orderStatusRes, topProductsRes, dailyOrdersRes, employeeSalesRes, topSellingProducts] = yield all([
      call(statisticsApi.getSummary, { type: action.payload }),
      call(statisticsApi.getOrderStatus, { type: action.payload }),
      call(statisticsApi.getTopSelling, { type: action.payload }),
      call(statisticsApi.getDailyOrders, { type: action.payload }),
      call(statisticsApi.getEmployeeSales, { type: action.payload }),
      call(statisticsApi.getTopSelling, {type: action.payload})
    ]);

    yield put(
      statisticsActions.fetchDataSuccess({
        summary: summaryRes.data, 
        orderStatus: orderStatusRes.data,
        topProducts: topProductsRes.data,
        dailyOrders: dailyOrdersRes.data, 
        employeeSales: employeeSalesRes.data,
        topSellingProducts: topSellingProducts.data
      })
    );
  } catch (error) {
    console.error("Error fetching statistics data:", error);
    yield put(statisticsActions.fetchDataError());
  }
}

export default function* statisticsSaga(): SagaIterator {
  yield takeLatest(statisticsActions.fetchData.type, handleFetchData);
}
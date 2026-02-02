import { all, call, put, takeLatest } from "redux-saga/effects";
import { statisticsActions } from "./statisticsSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import type { AxiosResponse } from "axios";
import statisticsApi from "../../api/statisticsApi";
import type { DashboardSummary } from "../../models/statistics";

function* handleFetchData(_action: PayloadAction<string>): SagaIterator {
    try {
        const [summaryRes]: [AxiosResponse<DashboardSummary>] = yield all([
            call(statisticsApi.getOverview),
        ]);

        yield put(
            statisticsActions.fetchDataSuccess({
                summary: summaryRes.data,
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
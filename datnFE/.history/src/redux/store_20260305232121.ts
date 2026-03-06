import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import customerReducer from "./customer/customerSlice";
import rootSaga from "../store/rootSaga";
import voucherReducer from "./Voucher/voucherSlice"; 
const sagaMiddleware = createSagaMiddleware();
import employeeReducer from "./employee/employeeSlice";
import statisticsReducer from "./statistics/statisticsSlice";
import shiftHandoverReducer from "./shiftHandover/shiftHandoverSlice";
import shiftTemplateReducer from "./shiftTemplate/ShiftTemplateSlice";
import discountReducer from "../redux/discount/discountSlice";
import productCategoryReducer from "./productCategory/productCategorySlice";
import techSpecReducer from "./techSpec/techSpecSlice";
import productReducer from "./product/productSlice";
import productImageReducer from "./productImage/productImageSlice";
import sensorTypeReducer from "./techSpec/sensorTypeSlice";
import lensMountReducer from "./techSpec/lensMountSlice";
import resolutionReducer from "./techSpec/resolutionSlice";
import processorReducer from "./techSpec/processorSlice";
import imageFormatReducer from "./techSpec/imageFormatSlice";
import videoFormatReducer from "./techSpec/videoFormatSlice";


export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employee: employeeReducer,
    statistics: statisticsReducer,
    voucher: voucherReducer,
    discount: discountReducer,
    shiftHandover: shiftHandoverReducer,
    shiftTemplate: shiftTemplateReducer,
  },
    productCategory: productCategoryReducer,
    techSpec: techSpecReducer,
    product: productReducer,
    productImage: productImageReducer,
    sensorType: sensorTypeReducer,
    lensMount: lensMountReducer,
    resolution: resolutionReducer,
    processor: processorReducer,
    imageFormat: imageFormatReducer,
    videoFormat: videoFormatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
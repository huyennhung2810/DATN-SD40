import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import customerReducer from "./customer/customerSlice";
import rootSaga from "../store/rootSaga";
const sagaMiddleware = createSagaMiddleware();
import employeeReducer from "./employee/employeeSlice";
import serialReducer from "./serial/serialSlice";
import colorReducer from "./color/colorSlice";
import storageCapacityReducer from "./storage/storageSlice";
import statisticsReducer from "./statistics/statisticsSlice";
import discountReducer from "../redux/discount/discountSlice";
import productDetailReducer from "./productdetail/productDetailSlice";
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
import voucherReducer from "./Voucher/voucherSlice";
import shiftHandoverReducer from "./shiftHandover/shiftHandoverSlice";
import shiftTemplateReducer from "./shiftTemplate/ShiftTemplateSlice";
import authReducer from "./auth/authSlice";
import chatReducer from "./chat/chatSlice";
import cartReducer from "./cart/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    employee: employeeReducer,
    statistics: statisticsReducer,
    voucher: voucherReducer,
    discount: discountReducer,
    shiftHandover: shiftHandoverReducer,
    shiftTemplate: shiftTemplateReducer,
    serial: serialReducer,
    productDetail: productDetailReducer,
    color: colorReducer,
    storage: storageCapacityReducer,
    //voucher: voucherReducer, // Đăng ký voucher reducer vào store
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
    chat: chatReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

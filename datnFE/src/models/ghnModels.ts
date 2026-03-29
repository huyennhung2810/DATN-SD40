// ============ GHN API Models ============

// --- Request ---
export interface GHNFeeRequest {
  from_district_id: number;
  from_ward_code: string;
  to_district_id: number;
  to_ward_code: string;
  service_id: number;
  weight: number;       // gram
  length: number;       // cm
  width: number;        // cm
  height: number;       // cm
  insurance_value?: number;
  cod_value?: number;
  coupon?: string;
}

export interface GHNServicesRequest {
  shop_id: number;
  from_district: number;
  to_district: number;
}

// --- Response ---
export interface GHNFeeData {
  total: number;
  service_fee: number;
  insurance_fee: number;
  pick_station_fee: number;
  coupon_value: number;
  cod_fee: number;
  r2s_fee: number;
  pick_remote_areas_fee: number;
  deliver_remote_areas_fee: number;
}

export interface GHNFeeResponse {
  code: number;
  message: string;
  data: GHNFeeData;
}

export interface GHNService {
  service_id: number;
  short_name: string;
  name: string;
  note: string;
  service_type_id: number;
}

export interface GHNServicesResponse {
  code: number;
  message: string;
  data: GHNService[];
}

// --- Master Data ---
export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  ProvinceType: string;
}

export interface GHNDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  DistrictType: string;
  SupportType: number[];
}

export interface GHNWard {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  WardType: string;
}

export interface GHNProvinceResponse {
  code: number;
  message: string;
  data: GHNProvince[];
}

export interface GHNDistrictResponse {
  code: number;
  message: string;
  data: GHNDistrict[];
}

export interface GHNWardResponse {
  code: number;
  message: string;
  data: GHNWard[];
}

// --- Internal App Types ---
export interface ShippingAddress {
  provinceCode: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
}

export interface ShippingFeeResult {
  total: number;
  serviceName: string;
  estimatedDays: string;
  details: GHNFeeData;
}

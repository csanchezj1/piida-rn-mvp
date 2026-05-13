import {
  QR_SCAN_CLEAR,
  QR_SCAN_CAMERA_ACTIVE,
  QR_SCAN_CODE_SCANNED,
  QR_SCAN_HAS_PERMISSION
} from '../../../utils/constants'

const initialState = {
  device:null,
  cameraActive:true,
  codeScanned:null,
  hasPermission:false,
};

const qrScanData = (state = initialState, action) => {
  switch (action.type) {
    case QR_SCAN_CAMERA_ACTIVE:
      return { ...state, cameraActive: action.payload};
    case QR_SCAN_CODE_SCANNED:
      return { ...state, codeScanned: action.payload};
    case QR_SCAN_HAS_PERMISSION:
      return { ...state, hasPermission: action.payload};
    case QR_SCAN_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default qrScanData; 
import { SVGEnum } from "../../../enums/svg-enum";
import * as React from "react";
import { SvgCss } from "react-native-svg/css";

const CUSTOM_SVG = {
  [SVGEnum.Back]: `<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.77524 1.21962C8.68332 1.12746 8.57411 1.05435 8.45389 1.00446C8.33367 0.954573 8.20478 0.928894 8.07461 0.928894C7.94445 0.928894 7.81556 0.954573 7.69534 1.00446C7.57511 1.05435 7.46591 1.12746 7.37399 1.21962L0.795239 7.79837C0.721849 7.87161 0.663624 7.95861 0.623897 8.05438C0.58417 8.15015 0.563721 8.25281 0.563721 8.3565C0.563721 8.46018 0.58417 8.56284 0.623897 8.65862C0.663624 8.75439 0.721849 8.84138 0.795239 8.91462L7.37399 15.4934C7.76191 15.8813 8.38732 15.8813 8.77524 15.4934C9.16316 15.1055 9.16316 14.48 8.77524 14.0921L3.04357 8.35254L8.78316 2.61295C9.16316 2.23295 9.16316 1.59962 8.77524 1.21962Z" fill="#1E232C" stroke="#1E232C" stroke-width="0.2"/>
  </svg>
  `,
};

const CustomSvg = ({ svgEnum, fill, stroke, ...props }) => {
  if (!svgEnum || !CUSTOM_SVG[svgEnum]) return null;

  let modifiedSvg = CUSTOM_SVG[svgEnum];

  if (fill) {
    modifiedSvg = modifiedSvg.replace(/fill=".*?"/g, `fill="${fill}"`);
  }

  if (stroke) {
    modifiedSvg = modifiedSvg.replace(/stroke=".*?"/g, `stroke="${stroke}"`);
  }

  return <SvgCss xml={modifiedSvg} {...props} width={props?.width ?? props?.size} height={props?.height ?? props?.size} />;
};
export default React.memo(CustomSvg);

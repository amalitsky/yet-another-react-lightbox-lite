import type React from "react";

/** Lightbox props */
export interface LightboxProps {
  /** slides to display in the lightbox */
  slides: Slide[];
  /** slide index */
  index: number | undefined;
  /** slide index change callback */
  setIndex: (index: number | undefined) => void;
  /** custom UI labels / translations */
  labels?: Labels;
  /** custom render functions */
  render?: Render;
  /** customization slots styles */
  styles?: SlotStyles;
}

/** Slide */
export type Slide = SlideTypes[SlideTypeKey];

/** Supported slide types */
export interface SlideTypes {
  /** image slide type */
  image: SlideImage;
}

/** Slide type key */
export type SlideTypeKey = keyof SlideTypes;

/** Generic slide */
export interface GenericSlide {
  /** slide key */
  key?: React.Key;
  /** slide type */
  type?: SlideTypeKey;
}

/** Image slide properties */
export interface SlideImage extends GenericSlide {
  /** image slide type */
  type?: "image";
  /** image URL */
  src: string;
  /** image width in pixels */
  width?: number;
  /** image height in pixels */
  height?: number;
  /** image 'alt' attribute */
  alt?: string;
  /** alternative images to be passed to the 'srcSet' */
  srcSet?: ImageSource[];
}

/** Image source */
export interface ImageSource {
  /** image URL */
  src: string;
  /** image width in pixels */
  width: number;
  /** image height in pixels */
  height: number;
}

/** Custom UI labels / translations */
export interface Labels {
  Previous?: string;
  Next?: string;
  Close?: string;
}

/** Label key */
export type Label = keyof Labels;

/** Custom render functions. */
export interface Render {
  /** render custom slide type, or override the default image slide */
  slide?: RenderFunction<RenderSlideProps>;
  /** render custom elements above each slide */
  slideHeader?: RenderFunction<RenderSlideProps>;
  /** render custom elements below or over each slide */
  slideFooter?: RenderFunction<RenderSlideProps>;
  /** render custom controls or additional elements in the lightbox (use absolute positioning) */
  controls?: RenderFunction;
  /** render custom Prev icon */
  iconPrev?: RenderFunction;
  /** render custom Next icon */
  iconNext?: RenderFunction;
  /** render custom Close icon */
  iconClose?: RenderFunction;
}

/** `render.slide` render function props */
export interface RenderSlideProps {
  /** slide */
  slide: Slide;
  /** slide */
  rect: Rect;
  /** if `true`, the slide is the current slide in the viewport */
  current: boolean;
}

/** Customization slots */
export interface SlotType {
  /** lightbox portal (root) customization slot */
  portal: "portal";
  /** lightbox carousel customization slot */
  carousel: "carousel";
  /** lightbox slide customization slot */
  slide: "slide";
  /** lightbox slide image customization slot */
  image: "image";
  /** lightbox button customization slot */
  button: "button";
  /** lightbox icon customization slot */
  icon: "icon";
}

/** Customization slots */
export type Slot = SlotType[keyof SlotType];

/** Customization slot CSS properties */
interface SlotCSSProperties extends React.CSSProperties {
  [key: `--yarll__${string}`]: string | number;
}

/** Customization slots styles */
export type SlotStyles = {
  [key in Slot]?: SlotCSSProperties;
};

/** Rect */
export type Rect = {
  width: number;
  height: number;
};

/** Generic callback function */
export type Callback<T = void> = () => T;

/** Render function */
export type RenderFunction<T = void> = [T] extends [void] ? () => React.ReactNode : (props: T) => React.ReactNode;

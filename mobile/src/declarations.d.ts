// TypeScript declarations for CSS and CSS Modules to support Expo Web / CSS imports
declare module '*.css';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

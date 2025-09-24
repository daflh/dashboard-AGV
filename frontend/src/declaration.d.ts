declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Add your environment variables here...
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
